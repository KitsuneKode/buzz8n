import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { REDIS_CONSUMER_GROUP, config, logger } from '@/utils'
import { processResponse } from '@/processor'
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

await redis.connect()

const controller = new AbortController()
const { signal } = controller

/**
 * Continuously reads and processes messages from the Redis consumer group until the provided AbortSignal is aborted.
 *
 * When the signal is aborted the function exits the processing loop and performs a graceful shutdown.
 *
 * @param signal - AbortSignal used to stop the worker loop and trigger graceful shutdown
 */
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

/**
 * Perform a graceful shutdown of Redis resources used by the worker.
 *
 * Attempts to unsubscribe the Redis client and run its cleanup routine. Logs a success message when the Redis connection is closed and logs a warning if cleanup fails.
 */
async function shutdown() {
  logger.info('Shutting down gracefully…')

  try {
    await redis.unsubscribe([redis.CHANNELS.EXECUTION_EVENTS])
    await redis.xGroupDestroy({
      consumerGroup: REDIS_CONSUMER_GROUP,
    })

    await redis.cleanup()
    logger.info('Redis connection closed.')
  } catch (err) {
    logger.warn('Redis cleanup failed:', err)
  }
}

// Graceful OS signal handling
const stop = () => controller.abort()
process.on('SIGINT', stop)
process.on('SIGTERM', stop)

main(signal)
