/**
 * @module processor/index
 * Process a single workflow execution request:
 *  - Parse nodes/edges from DB using your Zod schemas.
 *  - Find the webhook trigger and prune to its forward-reachable subgraph.
 *  - Build and validate DAG (adjacency + indegree).
 *  - Execute with bounded concurrency using Kahn’s algorithm.
 *  - ACK the Redis message (and optionally persist results/telemetry).
 *
 */

import {
  collectReachableFrom,
  buildGraph,
  validateDAG,
  executeGraphConcurrent,
} from '@/processor/dag'
import type { RFNode, RFEdge } from '@/processor/dag'

import type {
  EnqueueExecutionPayload,
  ManualTriggerData,
  WebhookTriggerData,
} from '@buzz8n/backend-common/types'
import { beginExecutionSetStatus, collapsePropertyNodes } from './helper'
import { edgesSchema, nodesSchema } from '@buzz8n/common/types'
import { runNode, type ExecContext } from '@/nodes'
import { prisma } from '@buzz8n/store'
import { logger } from '@/utils'
import { redis } from '@/redis'

interface ProcessExecutionResponseType {
  id: string
  payload: EnqueueExecutionPayload
}

function parseQueueData<T>(data: unknown): T {
  if (typeof data === 'string') return JSON.parse(data) as T
  return data as T
}

/**
 *
 * Handle one message pulled from the stream and execute the workflow DAG.
 * Fail-fast behavior: first node failure aborts dependents (they never reach indegree 0).
 *
 * @param {{ id: string, data: EnqueueExecutionPayload }} param0 - Stream message id and parsed payload.
 * @returns {Promise<void>} Resolves after ACK; logs errors and avoids poison-pill loops.
 *
 */
export const processResponse = async ({
  id,
  payload,
}: ProcessExecutionResponseType): Promise<void> => {
  const { workflowId, executionId, data } = payload
  logger.info(`Starting execution for workspace ${workflowId} with executionID: ${executionId}`)

  try {
    const triggerData = parseQueueData<WebhookTriggerData | ManualTriggerData>(data)

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

    const triggerId = nodes.find((n) => n?.data?.type === triggerData.triggerType)?.id

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

    const ctx: ExecContext = {
      userId: execution.userId,
      $json: {
        body:
          triggerData.triggerType === 'manualTrigger' ? (triggerData.body ?? {}) : triggerData.body,
        trigger: triggerData,
        executionId,
        workflowId,
      },
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
  } catch (err) {
    // This error now appears AFTER all async nodes have settled
    logger.warn(`Error executing the workflow:${workflowId}`, err)
  } finally {
    // Ensure counter/status and ACK always happen
    await redis.xAck({ messageID: id })
  }
}
