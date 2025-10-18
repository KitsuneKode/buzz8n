import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { config, logger } from '@/utils'
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

const processResponse = async (responseData: ProcessExecutionResponseType[]) => {
  responseData.forEach((res) =>
    logger.info(
      `Starting execution for workspace ${res.payload.workflowId} with executionID: ${res.payload.executionId}`,
    ),
  )
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
        await processResponse(executionRequests)
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
  } catch (err) {
    logger.warn('Unsubscribe failed:', err)
  }

  try {
    await redis.cleanup() // or redis.quit()
    logger.info('Redis connection closed.')
  } catch (err) {
    logger.warn('Redis cleanup failed:', err)
  }
}

main(signal)
