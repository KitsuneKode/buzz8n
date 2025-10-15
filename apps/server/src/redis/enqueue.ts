import { logger } from '@/utils/logger'
import { redis } from '@/redis'

await redis.connect()
redis.on('error', (err) => console.log('Redis Client Error', err))

const ENQUEUE_EXECUTION_QUEUE = 'workflow:execution'
const ENQUEUE_EXECUTION_QUEUE_MAX_LENGTH = 10000
const LOG_GROUP = '[REDIS]'

export interface EnqueueExecutionPayload {
  executionId: string
  workflowId: string
  payload: unknown
}

export const enqueueExecution = async ({
  executionId,
  workflowId,
  payload,
}: EnqueueExecutionPayload) => {
  try {
    await redis.xAdd(
      ENQUEUE_EXECUTION_QUEUE,
      '*',
      {
        executionId,
        workflowId,
        data: JSON.stringify(payload),
      },
      {
        TRIM: {
          strategy: 'MAXLEN',
          strategyModifier: '~',
          threshold: ENQUEUE_EXECUTION_QUEUE_MAX_LENGTH,
        },
      },
    )

    logger.info(`${LOG_GROUP} Execution is queued`, { executionId, workflowId })
  } catch (error) {
    logger.error(`${LOG_GROUP} Error queuing execution`, { executionId, workflowId, error })
    throw new Error(`${LOG_GROUP} Error queuing execution: ${executionId} , ${workflowId} ${error}`)
  }
}
