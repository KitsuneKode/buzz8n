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

const REDIS_CONSUMER_GROUP = `worker-${process.pid}`

await redis.connect()

const processResponse = async (response: ConsumerGroupResponseType[]) => {}

async function main() {
  logger.info('Worker Started! Beginning processing,!!!!')

  while (1) {
    try {
      const response = (await redis.xReadGroup({
        consumerGroup: REDIS_CONSUMER_GROUP,
      })) as ConsumerGroupResponseType[] | null

      if (!response || response.length < 1) {
        await sleep(200)
        continue
      }
      // console.log(response[0]?.messages[0]?.message)
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
          .filter(
            (v): v is { id: string; payload: EnqueueExecutionPayload } => v !== null,
          ),
      )

      console.log(executionRequests)
    } catch (error) {
      console.error(error)
      logger.error(`${redis.LOG_GROUP} Error reading the message`, { error })
    }
  }
  process.on('SIGINT', async () => {
    logger.info('Shutting down…')
    await redis.cleanup()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    logger.info('Shutting down…')
    await redis.cleanup()
    process.exit(0)
  })
}

main()
