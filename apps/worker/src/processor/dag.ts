/**
 *
 * @module processor/dag
 * @remarks Topological scheduling (Kahn’s algorithm) over DAGs with a bounded worker pool.
 * @see Topological sorting (Kahn’s algorithm)
 *
 * DAG utilities and executor for workflow nodes.
 *
 * This module:
 *    i> Builds a directed graph from nodes/edges (adjacency + indegree).
 *   ii> Seeds a ready queue from indegree-0 nodes.
 *  iii> Executes in topological order (Kahn’s algorithm) with optional concurrency.
 *
 * Why Kahn’s algorithm:
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
 * References: Topological sorting (Kahn’s algorithm) and DAG execution patterns.
 *
 */

import { renderGraphAscii } from '@/processor/helper'
import type { ExecContext, RunNode } from '@/nodes'

/**
 * Minimal node shape the executor needs: a unique id and optional data for dispatch/config.
 */
export type RFNode = {
  id: string
  data?: { type?: string; config?: Record<string, any> }
} & Record<string, any>
/**
 * Minimal directed edge shape: id, source, and target encode the arrow u -> v in the DAG.
 */
export type RFEdge = { id: string; source: string; target: string } & Record<string, any>

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
 *
 * Treat these as “do not execute”: they unlock downstream nodes but aren’t run as tasks.
 * Node types that act as triggers/entry points: auto-completed to unlock children without work.
 * This mirrors common workflow semantics where trigger nodes only inject/forward payload.
 *
 */
const TRIGGER_TYPES = new Set(['webhook', 'manualTrigger'])

/**
 *
 *  Computes the forward-reachable set of node ids from a starting node (e.g., a webhook trigger)
 * by following directed edges source -> target using a BFS over a children adjacency list.
 *
 * Rationale:
 *  - Execute only the subgraph reachable from the trigger to avoid running stray nodes.
 *  - Aligns with directed execution semantics of DAG workflows.
 *
 * Complexity: O(V + E) over the explored subgraph.
 *
 * @param {string} startId - Node id to start traversal from.
 * @param {RFEdge[]} edges - All directed edges; only forward direction is followed.
 * @returns {Set<string>} All node ids reachable from startId via directed edges.
 *
 */
export function collectReachableFrom(startId: string, edges: RFEdge[]): Set<string> {
  const children = new Map<string, string[]>()
  for (const e of edges) {
    if (!children.has(e.source)) children.set(e.source, [])
    children.get(e.source)!.push(e.target)
  }
  const seen = new Set<string>()
  const q = [startId]
  while (q.length) {
    const u = q.shift()!
    if (seen.has(u)) continue // skip if already visited
    seen.add(u)
    for (const v of children.get(u) ?? []) q.push(v) // follow u -> v
  }
  return seen
}

/**
 *
 *  Builds adjacency (children) and indegree maps for Kahn’s algorithm restricted to an allowed set:
 *  - nodeMap: id -> RFNode for O(1) lookup during scheduling.
 *  - children: parent id -> array of child ids (forward adjacency).
 *  - indegree: node id -> number of unmet prerequisites (incoming edges).
 *
 * Rationale:
 *  - Kahn’s algorithm uses indegree==0 as the readiness invariant for topological execution.
 *
 * Complexity: O(V + E) within the allowed set.
 *
 * @param {RFNode[]} nodes - All nodes available.
 * @param {RFEdge[]} edges - All edges available.
 * @param {Set<string>} allowed - Node ids to include (e.g., reachable from trigger).
 * @returns {{ nodeMap: Map<string, RFNode>, children: Map<string, string[]>, indegree: Map<string, number> }}
 *
 */
export function buildGraph(nodes: RFNode[], edges: RFEdge[], allowed: Set<string>) {
  const nodeMap = new Map(nodes.filter((n) => allowed.has(n.id)).map((n) => [n.id, n]))
  const children = new Map<string, string[]>()
  const indegree = new Map<string, number>()

  // Initialize adjacency and indegree for allowed nodes
  for (const id of nodeMap.keys()) {
    children.set(id, [])
    indegree.set(id, 0)
  }

  // Wire directed edges within the allowed set
  for (const e of edges) {
    if (!allowed.has(e.source) || !allowed.has(e.target)) continue
    children.get(e.source)!.push(e.target)
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1)
  }

  return { nodeMap, children, indegree }
}

/**
 *
 * Validates acyclicity (DAG property) via a dry-run of Kahn’s algorithm:
 *  - Seed a queue with indegree-0 nodes.
 *  - Repeatedly "remove" a node and decrement children’s indegrees.
 *  - If not all nodes are visited, a directed cycle exists.
 *
 * Complexity: O(V + E).
 *
 * @throws {Error} If a cycle is detected (no topological order exists).
 * @param {Map<string, string[]>} children - Adjacency list of parent -> children.
 * @param {Map<string, number>} indegree - Remaining prerequisites per node.
 * @returns {void}
 *
 */
export function validateDAG(children: Map<string, string[]>, indegree: Map<string, number>) {
  const copy = new Map(indegree)
  const q: string[] = [...Array.from(copy)].filter(([, d]) => d === 0).map(([id]) => id)
  let seen = 0

  while (q.length) {
    const u = q.shift()!
    seen++
    for (const v of children.get(u) ?? []) {
      copy.set(v, copy.get(v)! - 1)
      if (copy.get(v) === 0) q.push(v)
    }
  }

  if (seen !== indegree.size) throw new Error('Cycle detected: not a DAG')
}

/**
 * Collects node ids with indegree 0 (no unmet prerequisites) to seed the ready queue.
 *
 * @param {Map<string, number>} indegree - Remaining prerequisites per node.
 * @returns {string[]} Node ids ready to start now.
 */
function initialReady(indegree: Map<string, number>): string[] {
  return [...Array.from(indegree)].filter(([, d]) => d === 0).map(([id]) => id)
}

/**
 *
 *  Executes the DAG with a bounded worker pool using Kahn’s indegree readiness:
 *  - Maintain a ready queue of indegree-0 nodes and a running map of in-flight tasks.
 *  - Start tasks until maxConcurrency is reached; await Promise.race to free a slot.
 *  - On completion, decrement each child’s indegree; enqueue children that reach 0.
 *  - Auto-complete trigger nodes to unlock children without executing work.
 *
 * Guarantees:
 *  - Dependency correctness: no node runs before all predecessors complete (topological order).
 *  - Safe parallelism: independent branches run concurrently within the concurrency cap.
 *  - Linear-time scheduling over nodes + edges (excluding user task cost).
 *
 * @param {Map<string, RFNode>} nodeMap - id -> node for O(1) access.
 * @param {Map<string, string[]>} children - parent -> child ids adjacency.
 * @param {Map<string, number>} indegree - remaining prerequisites (mutated during execution).
 * @param {ExecContext} ctx - Shared context; results stored at ctx.$node[nodeId].
 * @param {RunNode} runNode - Async runner per node; may throw to signal failure.
 * @param {{ maxConcurrency?: number, failFast?: boolean }} [opts] - Concurrency cap (default 4) and fail-fast (default true).
 * @returns {Promise<ExecContext>} Final context with accumulated node results.
 * @throws {Error} If failFast and any node fails, or if nodes remain unreachable (cycle/unmet deps).
 *
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
    logger?: any // Winston instance with info/debug/error
    onEvent?: (e: DagEvent) => void | Promise<void>
    printGraph?: boolean // optional: print ASCII DAG structure
  },
) {
  const maxConcurrency = opts?.maxConcurrency ?? 4
  const failFast = opts?.failFast ?? true
  const logger = opts?.logger

  // One-time ASCII snapshot (compact)
  if (opts?.printGraph && logger) {
    logger.info('[DAG] Graph structure: \n\n')
    const snapshot = renderGraphAscii(nodeMap, children, indegree)
    snapshot.forEach((line) => console.log(line)) // Optional: print graph structure
  }

  const ready: string[] = initialReady(indegree)
  const running = new Map<string, Promise<void>>()
  const completed = new Set<string>()
  let failed = false

  // Timeline tracking
  const startTimes = new Map<string, number>()
  const finishTimes = new Map<string, number>()
  const executionOrder: string[] = []
  const timeline: Array<{ t: number; ev: string; id?: string; info?: any }> = []

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

      const res = TRIGGER_TYPES.has(node.data?.type ?? '')
        ? { status: 'ok', trigger: true, payload: ctx.$json.body }
        : await runNode(node, ctx)

      ctx.$node[id] = res
      completed.add(id)

      // Mark finish
      const dur = Date.now() - (startTimes.get(id) ?? Date.now())
      finishTimes.set(id, Date.now())
      timeline.push({ t: Date.now(), ev: 'node_succeeded', id })
      logger?.info('[DAG] node_succeeded:', { nodeId: id, durationMs: dur })

      // Unlock children
      for (const v of children.get(id) ?? []) {
        const prevIndegree = indegree.get(v)!
        indegree.set(v, prevIndegree - 1)
        if (indegree.get(v) === 0) {
          ready.push(v)
          timeline.push({ t: Date.now(), ev: 'enqueue_ready', id: v, info: { parent: id } })
          logger?.debug('[DAG] enqueue_ready:', { nodeId: v, afterParent: id })
        }
      }
    })()
      .catch((err) => {
        failed = true
        timeline.push({
          t: Date.now(),
          ev: 'node_failed',
          id,
          info: { error: String(err?.message ?? err) },
        })
        logger?.error('[DAG] node_failed:', { nodeId: id, error: String(err?.message ?? err) })
        throw err
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

  // Final summary
  logger?.info('[DAG] executionOrder:', { order: executionOrder })
  for (const id of executionOrder) {
    const s = startTimes.get(id)!
    const f = finishTimes.get(id)!
    logger?.debug('[DAG] timing:', {
      nodeId: id,
      start: new Date(s).toISOString(),
      finish: new Date(f).toISOString(),
      durationMs: f - s,
    })
  }

  const success = !failed && completed.size === nodeMap.size
  logger?.info('[DAG] execution_finished:', {
    success,
    completed: completed.size,
    total: nodeMap.size,
  })

  if (failFast && failed) throw new Error('Execution FAILED')
  if (completed.size !== nodeMap.size)
    throw new Error('Unreachable nodes remained (cycle or unmet dependency)')
  return ctx
}
