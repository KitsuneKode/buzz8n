import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { logger } from '@/utils/logger'
import { redis } from '@/redis'

await redis.connect()

export const enqueueExecution = async ({
  executionId,
  workflowId,
  data,
}: EnqueueExecutionPayload) => {
  try {
    await redis.xAdd({
      payload: {
        executionId,
        workflowId,
        data: JSON.stringify(data),
      },
    })

    logger.info(`${redis.LOG_GROUP} Execution is queued`, { executionId, workflowId })
  } catch (error) {
    logger.error(`${redis.LOG_GROUP} Error queuing execution`, { executionId, workflowId, error })
    throw new Error(
      `${redis.LOG_GROUP} Error queuing execution: ${executionId} , ${workflowId} ${error}`,
    )
  }
}
