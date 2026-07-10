/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @module processor/index
 * Process a single workflow execution request:
 *  - Parse nodes/edges from DB using your Zod schemas.
 *  - Find the webhook trigger and prune to its forward-reachable subgraph.
 *  - Build and validate DAG (adjacency + indegree).
 *  - Execute with bounded concurrency using Kahn’s algorithm.
 *  - ACK the Redis message (and optionally persist results/telemetry).
 *  - On failure: retry via re-enqueue (up to maxAttempts) or send to DLQ.
 *
 */

import {
  collectReachableFrom,
  buildGraph,
  validateDAG,
  executeGraphConcurrent,
} from '@/processor/dag'
import type { RFNode, RFEdge } from '@/processor/dag'

import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { beginExecutionSetStatus, collapsePropertyNodes } from './helper'
import { edgesSchema, nodesSchema } from '@buzz8n/common/types'
import { runNode, type ExecContext } from '@/nodes'
import { prisma } from '@buzz8n/store'
import { logger } from '@/utils'
import { redis } from '@/redis'

const DEFAULT_MAX_ATTEMPTS = 3

interface ProcessExecutionResponseType {
  id: string
  payload: EnqueueExecutionPayload
  maxAttempts?: number
}

function parseAttempts(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function serializeStreamPayload(
  payload: EnqueueExecutionPayload,
  attempts: number,
): Record<string, string> {
  const data = typeof payload.data === 'string' ? payload.data : JSON.stringify(payload.data ?? {})

  return {
    executionId: payload.executionId,
    workflowId: payload.workflowId,
    data,
    attempts: String(attempts),
  }
}

/**
 * On processing failure: re-enqueue with attempts+1 if under max, else DLQ; then ACK the old message.
 */
async function handleProcessingFailure({
  id,
  payload,
  maxAttempts,
  error,
}: {
  id: string
  payload: EnqueueExecutionPayload
  maxAttempts: number
  error: unknown
}): Promise<void> {
  const attempts = parseAttempts(payload.attempts)
  const reason = error instanceof Error ? error.message : String(error)

  try {
    if (attempts < maxAttempts) {
      const nextAttempts = attempts + 1
      await redis.xAdd({
        payload: serializeStreamPayload(payload, nextAttempts),
      })
      logger.warn(`Re-queued execution after failure (attempt ${nextAttempts}/${maxAttempts})`, {
        id,
        workflowId: payload.workflowId,
        executionId: payload.executionId,
        reason,
      })
    } else {
      await redis.xAddDlq({
        payload: serializeStreamPayload(payload, attempts),
        reason,
        originalId: id,
      })
      logger.error(`Moved execution to DLQ after ${attempts} attempts`, {
        id,
        workflowId: payload.workflowId,
        executionId: payload.executionId,
        reason,
        dlq: redis.DLQ_STREAM_KEY,
      })
    }
  } catch (requeueErr) {
    logger.error('Failed to re-queue or DLQ execution', {
      id,
      error: requeueErr,
      originalError: reason,
    })
  }

  await redis.xAck({ messageID: id })
}

/**
 *
 * Handle one message pulled from the stream and execute the workflow DAG.
 * Fail-fast behavior: first node failure aborts dependents (they never reach indegree 0).
 *
 * @param {{ id: string, payload: EnqueueExecutionPayload, maxAttempts?: number }} param0 - Stream message id and parsed payload.
 * @returns {Promise<void>} Resolves after ACK; retries or DLQs on failure.
 *
 */
export const processResponse = async ({
  id,
  payload,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: ProcessExecutionResponseType): Promise<void> => {
  const { workflowId, executionId, data } = payload
  logger.info(`Starting execution for workspace ${workflowId} with executionID: ${executionId}`)

  try {
    const execution = await prisma.execution.findFirst({
      where: {
        id: executionId,
        workflowId,
      },
      include: {
        workflow: {
          select: {
            nodes: true,
            edges: true,
          },
        },
      },
    })
    const { success: nodesSuccess, data: nodesAny } = nodesSchema.safeParse(
      execution?.workflow.nodes,
    )
    const { success: edgesSuccess, data: edgesAny } = edgesSchema.safeParse(
      execution?.workflow.edges,
    )

    const nodes = (nodesAny ?? []) as RFNode[]
    const edges = (edgesAny ?? []) as RFEdge[]

    // data from enqueue may be a JSON string (Redis field) or already an object
    const raw: unknown = typeof data === 'string' ? JSON.parse(data) : data
    const triggerTypeField =
      typeof raw === 'object' && raw !== null && 'triggerType' in raw
        ? (raw as { triggerType?: unknown }).triggerType
        : undefined
    const triggerType =
      triggerTypeField === 'webhook' || triggerTypeField === 'manualTrigger'
        ? [triggerTypeField]
        : []

    const triggerId = nodes.find((n) => n?.data?.type && triggerType.includes(n.data.type))?.id

    if (!execution || !nodesSuccess || !edgesSuccess || !triggerId) {
      if (!nodesSuccess || !edgesSuccess)
        logger.error('Unable to parse nodes/edges', { id, payload })
      else logger.error('Missing execution/workflow or webhook/manual trigger', { id, payload })
      await redis.xAck({ messageID: id })
      return
    }

    const startTime = Date.now()
    await beginExecutionSetStatus(workflowId, executionId, startTime)

    /**
     *
     *  Starts a workflow execution and tracks concurrent executions.
     * Uses Redis atomic counter to track how many instances are running.
     * Only updates DB status to 'active' when first execution starts.
     *
     */
    const { executableNodes, filteredEdges, nonExecutableIds } = collapsePropertyNodes(nodes, edges)
    logger.debug('[DAG] collapse_properties', {
      collapsedCount: nonExecutableIds.size,
      collapsedIds: Array.from(nonExecutableIds),
    })

    // Define the runnable subgraph from the trigger and build the DAG

    const reachable = collectReachableFrom(triggerId, filteredEdges)
    const execIdSet = new Set(executableNodes.map((n) => n.id))
    const allowed = new Set([...reachable].filter((id) => execIdSet.has(id)))

    const { nodeMap, children, indegree } = buildGraph(executableNodes, filteredEdges, allowed)
    validateDAG(children, indegree)

    // Prepare execution context; prefer explicit payload, then DB-stored triggerPayload
    const triggerPayload = (payload as any)?.data ?? (execution?.logs as any)?.triggerPayload ?? {}

    const ctx: ExecContext = {
      $json: { body: triggerPayload, executionId, workflowId },
      $node: {},
    }

    // Execute the DAG with bounded concurrency (tune as needed)
    await executeGraphConcurrent(nodeMap, children, indegree, ctx, runNode, {
      logger,
      printGraph: true,
      startTime,
      metadata: { workflowId, executionId }, // Pass metadata for ExecutionLog
    })

    logger.info(`Execution finished successfully for ${executionId} `)
    await redis.xAck({ messageID: id })
  } catch (err) {
    // This error now appears AFTER all async nodes have settled
    logger.warn(`Error executing the workflow:${workflowId}`, err)
    await handleProcessingFailure({ id, payload, maxAttempts, error: err })
  }
}
