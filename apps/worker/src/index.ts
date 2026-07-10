import { parseEnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { REDIS_CONSUMER, config, logger } from '@/utils'
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

interface ExecutionRequest {
  id: string
  payload: EnqueueExecutionPayload
}

function stringifyStreamMessage(message: unknown): string {
  if (typeof message === 'string') return message

  try {
    return JSON.stringify(message)
  } catch {
    return String(message)
  }
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
        consumer: REDIS_CONSUMER,
      })) as ConsumerGroupResponseType[] | null

      if (!response || response.length < 1) {
        await sleep(200)
        continue
      }

      const executionRequests: ExecutionRequest[] = []

      for (const res of response) {
        for (const { id, message } of res.messages) {
          const parsed = parseEnqueueExecutionPayload(message)
          if (!parsed.success) {
            logger.warn('Invalid queue payload; sending to DLQ', {
              id,
              message,
              issues: parsed.error.issues,
            })
            await redis.xAddDlq({
              originalId: id,
              reason: 'invalid_payload',
              payload: stringifyStreamMessage(message),
              at: String(Date.now()),
            })
            await redis.xAck({ messageID: id })
            continue
          }

          executionRequests.push({ id, payload: parsed.data })
        }
      }

      if (executionRequests.length > 0) {
        await Promise.all(executionRequests.map((req) => processResponse(req)))
      }
    } catch (error) {
      if (signal.aborted) break

      const err = (error as Error)?.message ?? String(error)
      if (err.includes('NOGROUP')) {
        logger.error(`${redis.LOG_GROUP} Consumer Group not found`, { error })
        break
      } else {
        logger.error(`${redis.LOG_GROUP} Error reading the message`, { error })
      }
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

    // Remove only this worker from the consumer group so other workers keep running.
    await redis.xGroupDelConsumer({
      consumer: REDIS_CONSUMER,
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
