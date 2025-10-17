import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { config, logger } from '@/utils'
import { redis } from '@/redis'

config.validateAll()
interface ConsumerGroupResponseMessage {
  id: string
  message: EnqueueExecutionPayload
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
        continue
      }
      // console.log(response[0]?.messages[0]?.message)
      const executionRequests = response.map((res) =>
        res.messages.filter((msg) => {
          if (msg.message) {
            return typeof msg.message === 'string' ? JSON.parse(msg.message) : msg.message
          }
          return false
        }),
      )?.[0]

      console.log(executionRequests)
    } catch (error) {
      console.error(error)
      logger.error(`${redis.LOG_GROUP} Error reading the message`, { error })
    }
  }

  await redis.cleanup()
}

main()
