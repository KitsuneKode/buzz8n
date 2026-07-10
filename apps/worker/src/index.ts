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

/** Reclaim cadence: block on read up to this long, then reclaim before next batch */
const READ_BLOCK_MS = 30_000
const RECLAIM_MIN_IDLE_MS = 60_000
const RECLAIM_COUNT = 10

await redis.connect()

/**
 * Ensure the Redis consumer group exists (idempotent; ignores BUSYGROUP).
 */
async function ensureConsumerGroup() {
  try {
    await redis.xGroupCreate()
    logger.info('Created Redis consumer group workflow:executors')
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? String(err)
    if (msg.includes('BUSYGROUP')) {
      logger.info('Redis consumer group already exists')
    } else {
      throw err
    }
  }
}

await ensureConsumerGroup()

const controller = new AbortController()
const { signal } = controller

function parseStreamMessages(
  messages: Array<{ id: string; message: unknown } | null | undefined>,
): Array<{ id: string; payload: EnqueueExecutionPayload }> {
  return messages
    .map((entry) => {
      if (!entry || !entry.id) return null
      try {
        const { id, message } = entry
        const payload =
          typeof message === 'string'
            ? (JSON.parse(message) as EnqueueExecutionPayload)
            : (message as EnqueueExecutionPayload)

        return { id, payload }
      } catch {
        logger.warn('Invalid message JSON; skipping', { message: entry?.message })
        return null
      }
    })
    .filter((v): v is { id: string; payload: EnqueueExecutionPayload } => v !== null)
}

/**
 * Reclaim idle pending messages (XAUTOCLAIM) and process them.
 */
async function reclaimPending(): Promise<void> {
  try {
    const claimed = await redis.xAutoClaim({
      consumer: REDIS_CONSUMER,
      minIdleMs: RECLAIM_MIN_IDLE_MS,
      count: RECLAIM_COUNT,
    })

    const rawMessages = claimed?.messages ?? []
    const messages: Array<{ id: string; message: unknown }> = []
    for (const m of rawMessages) {
      if (m != null && typeof m === 'object' && 'id' in m && typeof m.id === 'string') {
        messages.push({ id: m.id, message: m.message })
      }
    }

    if (messages.length === 0) return

    logger.info(`Reclaimed ${messages.length} idle pending message(s)`, {
      consumer: REDIS_CONSUMER,
      minIdleMs: RECLAIM_MIN_IDLE_MS,
    })

    const executionRequests = parseStreamMessages(messages)
    if (executionRequests.length > 0) {
      await Promise.all(executionRequests.map((req) => processResponse(req)))
    }
  } catch (error) {
    if (signal.aborted) return
    const err = (error as Error)?.message ?? String(error)
    if (err.includes('NOGROUP')) {
      logger.error(`${redis.LOG_GROUP} Consumer Group not found during reclaim`, { error })
      try {
        await ensureConsumerGroup()
      } catch (createErr) {
        logger.error('Failed to recreate consumer group during reclaim', { error: createErr })
      }
    } else {
      logger.error(`${redis.LOG_GROUP} Error reclaiming pending messages`, { error })
    }
  }
}

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
      // Reclaim idle PEL entries before each read batch (~every READ_BLOCK_MS when idle)
      await reclaimPending()

      const response = (await redis.xReadGroup({
        consumer: REDIS_CONSUMER,
        blockMs: READ_BLOCK_MS,
      })) as ConsumerGroupResponseType[] | null

      if (!response || response.length < 1) {
        await sleep(200)
        continue
      }

      const executionRequests = response.flatMap((res) => parseStreamMessages(res.messages))
      if (executionRequests.length > 0) {
        await Promise.all(executionRequests.map((req) => processResponse(req)))
      }
    } catch (error) {
      if (signal.aborted) break

      const err = (error as Error)?.message ?? String(error)
      if (err.includes('NOGROUP')) {
        logger.error(`${redis.LOG_GROUP} Consumer Group not found`, { error })
        try {
          await ensureConsumerGroup()
        } catch (createErr) {
          logger.error('Failed to recreate consumer group', { error: createErr })
          break
        }
      } else {
        logger.error(`${redis.LOG_GROUP} Error reading the message`, { error })
      }
    }
  }

  await shutdown()
}

/**
 * Perform a graceful shutdown of Redis resources used by the worker.
 * Removes only this consumer (multi-worker safe). Does not destroy the group.
 */
async function shutdown() {
  logger.info('Shutting down gracefully…')

  try {
    await redis.unsubscribe([redis.CHANNELS.EXECUTION_EVENTS])

    // Multi-worker safe: only remove this consumer. Never xGroupDestroy here.
    // Pending messages for this consumer remain in the PEL for other workers to XAUTOCLAIM.
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
