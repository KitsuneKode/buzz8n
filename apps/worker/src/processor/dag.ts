/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 *
 * @module processor/dag
 * @remarks Topological scheduling (Kahn's algorithm) over DAGs with a bounded worker pool.
 * @see Topological sorting (Kahn's algorithm)
 *
 * DAG utilities and executor for workflow nodes.
 *
 * This module:
 *    i> Builds a directed graph from nodes/edges (adjacency + indegree).
 *   ii> Seeds a ready queue from indegree-0 nodes.
 *  iii> Executes in topological order (Kahn's algorithm) with optional concurrency.
 *
 * Why Kahn's algorithm:
 *    i> Guarantees a valid topological order on DAGs (dependency-correct scheduling).
 *   ii> Exposes safe parallelism for independent branches with bounded workers.
 *  iii> Linear-time in nodes + edges for scalable pipelines.
 *
 * Exports:
 *  -> TRIGGER_TYPES: node types auto-completed to unlock children.
 *  -> collectReachableFrom(startId, edges): forward-reachable subgraph from a trigger.
 *  -> buildGraph(nodes, edges, allowed): adjacency and indegree over allowed ids.
 *  -> validateDAG(children, indegree): cycle detection via dry Kahn pass.
 *  -> executeGraphConcurrent(nodeMap, children, indegree, ctx, runNode, opts): bounded concurrent executor.
 *
 * References: Topological sorting (Kahn's algorithm) and DAG execution patterns.
 *
 */

import { endExecutionSetStatus, renderGraphAscii } from '@/processor/helper'
import { TRIGGER_TYPES, initialReady, type RFNode } from './graph'
import { nodeResultToExecutionLog } from './execution-log'
import { publishNodeEvent } from '@/services/publisher'
import type { ExecContext, RunNode } from '@/nodes'
import Mustache from 'mustache'

export {
  buildGraph,
  collectReachableFrom,
  initialReady,
  validateDAG,
  type RFEdge,
  type RFNode,
} from './graph'

/**
 * DAG lifecycle events suitable for forwarding to an external executor/telemetry.
 * These are emitted in addition to logger lines for flexible consumption.
 */
export type DagEvent =
  | { type: 'execution_started'; at: number; total: number }
  | { type: 'ready_init'; at: number; ready: string[] }
  | { type: 'node_started'; at: number; nodeId: string; running: number; ready: number }
  | { type: 'node_succeeded'; at: number; nodeId: string; durationMs: number }
  | { type: 'node_failed'; at: number; nodeId: string; error: string }
  | { type: 'enqueue_ready'; at: number; nodeId: string; parentId: string; indegree: number }
  | { type: 'slot_freed'; at: number; nodeId: string; running: number }
  | { type: 'await_race'; at: number; running: number }
  | { type: 'race_done'; at: number; running: number }
  | { type: 'execution_finished'; at: number; succeeded: boolean; completed: number; total: number }

/**
 * Schedule and execute nodes of a DAG in topological order using a bounded worker pool.
 *
 * Executes ready nodes (indegree 0) respecting dependencies and a concurrency cap,
 * auto-completes trigger-type nodes to unlock their children without invoking work,
 * and records per-node results and timing in the provided ExecContext.
 *
 * @param nodeMap - Map of node id to node; used for lookup during execution.
 * @param children - Adjacency map from parent id to array of child ids.
 * @param indegree - Mutable map of remaining prerequisites per node; values are decremented during execution.
 * @param ctx - Shared execution context; per-node results are stored on ctx.$node[nodeId].
 * @param runNode - Async function invoked to perform real work for a node (not invoked for trigger nodes).
 * @param opts - Optional settings; notable defaults: maxConcurrency = 4, failFast = true.
 * @returns The same ExecContext instance populated with node results and timeline information.
 * @throws Error when failFast is enabled and any node fails, or when some nodes remain unreachable (cycle or unmet dependency).
 */
export async function executeGraphConcurrent(
  nodeMap: Map<string, RFNode>,
  children: Map<string, string[]>,
  indegree: Map<string, number>,
  ctx: ExecContext,
  runNode: RunNode,

  opts?: {
    maxConcurrency?: number
    failFast?: boolean
    startTime: number
    logger?: any // Winston instance with info/debug/error
    onEvent?: (e: DagEvent) => void | Promise<void>
    printGraph?: boolean // optional: print ASCII DAG structure
    metadata?: { workflowId?: string; executionId?: string; userId?: string } // for ExecutionLog
  },
) {
  const maxConcurrency = (opts?.maxConcurrency ?? Number(process.env.DAG_MAX_CONCURRENCY)) || 4
  const failFast = opts?.failFast ?? true
  const logger = opts?.logger
  const metadata = opts?.metadata

  // One-time ASCII snapshot (compact)
  if (opts?.printGraph && logger) {
    logger.info('[DAG] Graph structure: \n\n')
    const snapshot = renderGraphAscii(nodeMap, children, indegree)
    snapshot.forEach((line) => logger.info(line))
  }

  const ready: string[] = initialReady(indegree)
  const running = new Map<string, Promise<void>>()
  const completed = new Set<string>()
  const failedNodes = new Map<string, Error | string>() // Track failed nodes with their errors
  let failed = false

  // Timeline tracking
  const startTimes = new Map<string, number>()
  const finishTimes = new Map<string, number>()
  const executionOrder: string[] = []
  const timeline: Array<{ t: number; ev: string; id?: string; info?: unknown }> = []

  // Log initial ready
  timeline.push({ t: Date.now(), ev: 'ready_init', info: [...ready] })
  logger?.info('[DAG] ready_init:', { ready })

  /**
   * Attempts to start execution of a ready node if a worker slot is available:
   * - Auto-complete triggers
   * - Await runNode for normal tasks
   * - On success, propagate readiness to children via indegree-- and enqueue when it hits 0
   * - Track the Promise in 'running' to bound concurrency and await completions
   */
  const start = (id: string) => {
    if (running.size >= maxConcurrency) return false
    if (completed.has(id)) return false

    const node = nodeMap.get(id)!
    startTimes.set('execution', Date.now())
    const p = (async () => {
      // Mark start
      startTimes.set(id, Date.now())
      executionOrder.push(id)
      timeline.push({ t: Date.now(), ev: 'node_started', id })
      logger?.info('[DAG] node_started:', {
        nodeId: id,
        type: node.data?.type,
        running: running.size + 1,
        ready: ready.length,
      })

      // Publish node started event for real-time updates
      const startedLog = nodeResultToExecutionLog(
        id,
        node,
        ctx,
        startTimes.get(id),
        undefined, // No end time yet
        undefined, // No error
        metadata,
        'loading', // Custom status
      )
      startedLog.message = `Node ${id} (${node.data?.type}) started execution`

      await publishNodeEvent(ctx.$json.executionId, startedLog)

      const res = TRIGGER_TYPES.has(node.data?.type ?? '')
        ? { status: 'ok', trigger: true, payload: ctx.$json.body }
        : await runNode(node, ctx)

      // Store both input config and output result
      ctx.$node[id] = {
        input: node.data?.config || {},
        output: res,
      }

      // Also store resolved configs in $json for easy template access
      if (node.data?.config && node.data?.type && !TRIGGER_TYPES.has(node.data.type)) {
        const nodeType = node.data.type
        const config = node.data.config

        // Create a unique key for this node type (handle duplicates)
        let key = nodeType
        let counter = 2
        while (ctx.$json[key]) {
          key = `${nodeType}${counter}`
          counter++
        }

        // Store resolved config values
        ctx.$json[key] = {}
        for (const [field, value] of Object.entries(config)) {
          if (typeof value === 'string' && value.includes('{{')) {
            // Resolve template in config value
            try {
              const resolved = Mustache.render(value, ctx)
              ctx.$json[key][field] = resolved
            } catch {
              // If template resolution fails, store original value
              ctx.$json[key][field] = value
            }
          } else {
            ctx.$json[key][field] = value
          }
        }
      }
      completed.add(id)

      // Mark finish
      const dur = Date.now() - (startTimes.get(id) ?? Date.now())
      finishTimes.set(id, Date.now())
      timeline.push({ t: Date.now(), ev: 'node_succeeded', id })
      logger?.info('[DAG] node_succeeded:', { nodeId: id, durationMs: dur })

      // Publish node success to real-time frontend updates
      const successLog = nodeResultToExecutionLog(
        id,
        node,
        ctx,
        startTimes.get(id),
        finishTimes.get(id),
        undefined,
        metadata,
      )
      ctx.logs?.push(successLog)

      await publishNodeEvent(ctx.$json.executionId, successLog)

      // Unlock children
      for (const v of children.get(id) ?? []) {
        const prevIndegree = indegree.get(v)!
        indegree.set(v, prevIndegree - 1)
        if (indegree.get(v) === 0) {
          ready.push(v)
          ready.sort()
          timeline.push({ t: Date.now(), ev: 'enqueue_ready', id: v, info: { parent: id } })
          logger?.debug('[DAG] enqueue_ready:', { nodeId: v, afterParent: id })
        }
      }
    })()
      .catch(async (err) => {
        failed = true
        failedNodes.set(id, err)
        finishTimes.set(id, Date.now()) // Set finish time for failed nodes
        timeline.push({
          t: Date.now(),
          ev: 'node_failed',
          id,
          info: { error: String(err?.message ?? err) },
        })
        logger?.warn('[DAG] node_failed:', { nodeId: id, error: String(err?.message ?? err) })

        // Publish node failure to real-time frontend updates
        const failureLog = nodeResultToExecutionLog(
          id,
          node,
          ctx,
          startTimes.get(id),
          finishTimes.get(id),
          err,
          metadata,
        )
        ctx.logs?.push(failureLog)

        await publishNodeEvent(ctx.$json.executionId, failureLog)

        // throw err
      })
      .finally(() => {
        running.delete(id)
        timeline.push({ t: Date.now(), ev: 'slot_freed', id })
        logger?.debug('[DAG] slot_freed by:', { nodeId: id, running: running.size })
      })

    running.set(id, p)
    return true
  }

  // Main execution loop
  while ((ready.length || running.size) && !(failFast && failed)) {
    while (ready.length && running.size < maxConcurrency) start(ready.shift()!)
    if (running.size === 0) break
    timeline.push({ t: Date.now(), ev: 'await_race' })
    await Promise.race(running.values())
    timeline.push({ t: Date.now(), ev: 'race_done' })
  }

  // Wait for all remaining running promises to settle before generating summary
  // This prevents "Error executing workflow" from appearing before async nodes complete
  if (running.size > 0) {
    logger?.debug('[DAG] Waiting for remaining nodes to complete:', { remaining: running.size })
    await Promise.allSettled(running.values())
  }
  const startTime = opts?.startTime || Date.now()

  const timeTaken = Date.now() - startTime
  // Final summary - always log, even on failures
  logger?.info('[DAG] executionOrder:', { order: executionOrder })

  // Only log timing for nodes that have valid start and finish times
  for (const id of executionOrder) {
    const s = startTimes.get(id)
    const f = finishTimes.get(id)
    if (s && f) {
      logger?.debug('[DAG] timing:', {
        nodeId: id,
        start: new Date(s).toISOString(),
        finish: new Date(f).toISOString(),
        durationMs: f - s,
      })
    } else {
      logger?.debug('[DAG] timing:', {
        nodeId: id,
        status: 'incomplete',
        startTime: s ? new Date(s).toISOString() : 'not started',
      })
    }
  }

  const success = !failed && completed.size === nodeMap.size
  const summary = {
    success,
    completed: completed.size,
    failed: failedNodes.size,
    timeTaken,
    total: nodeMap.size,
  }

  logger?.info(
    `[DAG] Execution ${success ? 'succeeded' : 'failed'}: ${summary.completed}/${summary.total} completed, ${summary.failed} failed, time taken ${timeTaken}ms`,
  )

  const executionSummary = `Execution ${success ? 'succeeded' : 'failed'}: ${summary.completed}/${summary.total} completed, ${summary.failed} failed`

  await endExecutionSetStatus(ctx.$json.workflowId, success ? 'success' : 'error')
  // Publish execution completion event
  await publishNodeEvent(ctx.$json.executionId, {
    id: `execution_complete_${Date.now()}`,
    type: 'execution_complete',
    timestamp: new Date(startTimes.get('execution')!),
    nodeId: 'execution',
    status: success ? 'success' : 'error',
    level: success ? 'info' : 'error',
    executionSummary,
    durationMs: timeTaken,
    message: success
      ? `Execution completed successfully: ${completed.size}/${nodeMap.size} nodes completed`
      : `Execution failed: ${failedNodes.size} nodes failed`,
    context: {
      input: { total: nodeMap.size },
      output: {
        completed: completed.size,
        failed: failedNodes.size,
        success,
      },
    },
    metadata,
  })

  if (failFast && failed) throw new Error('Execution FAILED')
  if (completed.size !== nodeMap.size)
    throw new Error('Unreachable nodes remained (cycle or unmet dependency)')
  return { ctx, summary }
}
