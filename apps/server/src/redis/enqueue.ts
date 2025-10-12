import { logger } from '@/utils/logger'
import { redis } from '@/redis'

await redis.connect()
redis.on('error', (err) => console.log('Redis Client Error', err))

interface EnqueueExecutionPayload {
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
      'workflow:execution',
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
          threshold: 10000,
        },
      },
    )

    logger.info('Execution is queued', { executionId, workflowId })
  } catch (error) {
    logger.error('Error queuing execution', { executionId, workflowId, error })
  }
}
