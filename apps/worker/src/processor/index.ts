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
import type { RFNode, RFEdge, ExecContext, RunNode } from '@/processor/dag'

import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { beginExecutionSetStatus, endExecutionSetStatus } from './helper'
import { edgesSchema, nodesSchema } from '@buzz8n/common/types'
import { prisma } from '@buzz8n/store'
import { logger } from '@/utils'
import { redis } from '@/redis'
import { sleep } from 'bun'

interface ProcessExecutionResponseType {
  id: string
  payload: EnqueueExecutionPayload
}

/**
 *
 * Handle one message pulled from the stream and execute the workflow DAG.
 * Fail-fast behavior: first node failure aborts dependents (they never reach indegree 0).
 *
 * @param {{ id: string, payload: EnqueueExecutionPayload }} param0 - Stream message id and parsed payload.
 * @returns {Promise<void>} Resolves after ACK; logs errors and avoids poison-pill loops.
 *
 */
export const processResponse = async ({
  id,
  payload,
}: ProcessExecutionResponseType): Promise<void> => {
  const { workflowId, executionId } = payload
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

    const webhookNodeId = nodes.find((node) => node?.data?.type === 'webhook')?.id

    if (!execution || !nodesSuccess || !edgesSuccess || !webhookNodeId) {
      if (!nodesSuccess || !edgesSuccess)
        logger.error('Unable to parse nodes/edges', { id, payload })
      else logger.error('Missing execution/workflow or webhook trigger', { id, payload })
      await redis.xAck({ messageID: id })
      return
    }

    let began = false
    try {
      await beginExecutionSetStatus(workflowId)
      began = true

      /**
       *
       *  Starts a workflow execution and tracks concurrent executions.
       * Uses Redis atomic counter to track how many instances are running.
       * Only updates DB status to 'active' when first execution starts.
       *
       */

      // Define the runnable subgraph from the trigger and build the DAG
      const reachable = collectReachableFrom(webhookNodeId, edges)
      const { nodeMap, children, indegree } = buildGraph(nodes, edges, reachable)
      validateDAG(children, indegree)

      // Prepare execution context; prefer explicit payload, then DB-stored triggerPayload
      const triggerPayload =
        (payload as any)?.data ?? (execution?.output as any)?.triggerPayload ?? {}
      const ctx: ExecContext = { $json: { body: triggerPayload }, $node: {} }

      // Minimal per-type node runner stub; extend as you add integrations
      const runNode: RunNode = async (node, context) => {
        // await prisma.execution.update({ where: { id: executionId }, data: { status: 'success', output: ctx.$node } });

        switch (node.data?.type) {
          case 'telegramSendMessage':
            console.log('telegram')
            await sleep(5000)
            // TODO: invoke Telegram API using node.data.config and context.$node
            return { status: 'ok' }
          case 'emailSend':
            console.log('email')
            await sleep(5000)
            // TODO: send email using provider/credentials in node.data.config
            return { status: 'ok' }
          case 'aiAgent':
            // TODO: call your model/tooling with inputs from context.$node
            console.log('aiAgent')
            await sleep(10000)
            return { status: 'ok' }
          default:
            // Default: no-op success so downstream edges can proceed
            await sleep(6000)
            return { status: 'ok' }
        }
      }

      logger.debug(webhookNodeId)

      // Execute the DAG with bounded concurrency (tune as needed)
      await executeGraphConcurrent(nodeMap, children, indegree, ctx, runNode, {
        logger,
        printGraph: true,
      })

      logger.info(`Execution finished for ${executionId}`)
    } finally {
      if (began) {
        // persist final state/results/telemetry here
        console.log('here')
        await endExecutionSetStatus(workflowId) // DECR + TTL + status flip on zero
      }
    }

    //TODO: Publish the status of the workflow to redis to use it in fe
  } catch (err) {
    logger.error('Error Processing Message', err)
  } finally {
    // Ensure counter/status and ACK always happen
    await redis.xAck({ messageID: id })
  }
}
