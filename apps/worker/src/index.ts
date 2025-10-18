import { edgeSchema, edgesSchema, nodeSchema, nodesSchema } from '@buzz8n/common/types'
import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { config, logger } from '@/utils'
import { prisma } from '@buzz8n/store'
import { redis } from '@/redis'
import { sleep } from 'bun'

config.validateAll()
interface ConsumerGroupResponseMessage {
  id: string
  message: unknown
}
interface ConsumerGroupResponseType {
  name: string
  messages: ConsumerGroupResponseMessage[]
}

interface ProcessExecutionResponseType {
  id: string
  payload: EnqueueExecutionPayload
}

const REDIS_CONSUMER_GROUP = `worker-${process.pid}`

await redis.connect()

const controller = new AbortController()
const { signal } = controller

const processResponse = async ({ id, payload }: ProcessExecutionResponseType) => {
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

    const { success: nodesSuccess, data: nodes } = nodesSchema.safeParse(execution?.workflow.nodes)
    const { success: edgesSuccess, data: edges } = edgesSchema.safeParse(execution?.workflow.edges)

    const webhookNodeId = nodes?.find((node) => node.data.type === 'webhook')?.id

    if (!execution || !nodesSuccess || !edgesSuccess || !webhookNodeId) {
      if (!nodesSuccess || !edgesSuccess) {
        logger.error('Unable to parse nodeData or edgeData', { id, payload })
      } else {
        logger.error('Tried to execute non existent workflow or empty workflow', { id, payload })
      }
      await redis.xAck({
        messageID: id,
      })
      return
    }

    /**
     * Starts a workflow execution and tracks concurrent executions.
     * Uses Redis atomic counter to track how many instances are running.
     * Only updates DB status to 'active' when first execution starts.
     */
    const INACTIVITY_TIMEOUT = 5 * 60 * 60 // 5 hours in seconds
    const WORKFLOW_ACTIVE_COUNT_KEY = `workflow:${workflowId}:active_count`

    const activeCount = await redis.incr(WORKFLOW_ACTIVE_COUNT_KEY)

    await redis.expire(WORKFLOW_ACTIVE_COUNT_KEY, INACTIVITY_TIMEOUT)
    //TODO: process payload if exists, and update prisma status table

    // Only first execution (count === 1) updates DB status
    if (activeCount === 1) {
      // const updatedWorkflow = await prisma.workflow.update({
      //   data: {
      //     status: 'loading',
      //   },
      // })
    }

    const connectedNodeIds = new Set(edges.flatMap((edge) => [edge.source, edge.target]))

    //FIXME: This is not correct
    const independentNodeChainStartIds = new Set(
      edges.flatMap((edge) => (edge.source && !edge.target ? [edge.source] : [])),
    )
    console.log('independentNodeChainStartIds', independentNodeChainStartIds.size)

    const totalEssentialNodes = nodes.filter(
      (node) =>
        !(node.data.type === 'manualTrigger' || node.data.type === 'webhook') &&
        connectedNodeIds.has(node.id),
    )

    const startEdge = edges.find((edge) => edge.source === webhookNodeId)

    logger.debug(webhookNodeId, totalEssentialNodes.length, startEdge)
    //TODO: Publish the status of the workflow to redis to use it in fe
  } catch (err) {
    logger.error('Error Processing Message', err)
  }
}

async function main(signal: AbortSignal) {
  logger.info('Worker Started! Beginning processing')

  while (!signal.aborted) {
    try {
      const response = (await redis.xReadGroup({
        consumerGroup: REDIS_CONSUMER_GROUP,
      })) as ConsumerGroupResponseType[] | null

      if (!response || response.length < 1) {
        await sleep(200)
        continue
      }

      const executionRequests = response.flatMap((res) =>
        res.messages
          .map(({ id, message }) => {
            try {
              const payload =
                typeof message === 'string'
                  ? (JSON.parse(message) as EnqueueExecutionPayload)
                  : (message as EnqueueExecutionPayload)

              return { id, payload }
            } catch {
              logger.warn('Invalid message JSON; skipping', { message })
              return null
            }
          })
          .filter((v): v is { id: string; payload: EnqueueExecutionPayload } => v !== null),
      )
      if (executionRequests && executionRequests.length > 0) {
        await Promise.all(executionRequests.map((req) => processResponse(req)))
      }
    } catch (error) {
      if (signal.aborted) break
      console.error(error)
      logger.error(`${redis.LOG_GROUP} Error reading the message`, { error })
    }
  }

  await shutdown()
}

async function shutdown() {
  logger.info('Shutting down gracefully…')

  try {
    await redis.unsubscribe()
    await redis.cleanup()
    logger.info('Redis connection closed.')
  } catch (err) {
    logger.warn('Redis cleanup failed:', err)
  }
}

main(signal)
