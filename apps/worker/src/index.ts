import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { config, logger } from '@/utils'
import { redis } from '@/redis'

config.validateAll()
interface ConsumerGroupResponseMessage {
  id: string
  message: EnqueueExecutionPayload[]
}
interface ConsumerGroupResponseType {
  name: string
  messages: ConsumerGroupResponseMessage[]
}

const REDIS_CONSUMER_GROUP = `worker-${process.pid}`

await redis.connect()

async function main() {
  logger.info('Worker Started! Beginning processing')

  while (true) {
    try {
      const response = (await redis.xReadGroup({
        consumerGroup: REDIS_CONSUMER_GROUP,
      })) as ConsumerGroupResponseType[] | null

      if (!response || response.length < 1) {
        continue
      }
      console.log(response)
      // logger.info(response[0]?.messages[0]?.message)
    } catch (error) {
      console.error(error)
      logger.error(`${redis.LOG_GROUP} Error reading the message`, { error })
    }
  }
}

main()
