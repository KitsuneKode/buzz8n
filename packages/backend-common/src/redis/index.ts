import { backendLogger, workerLogger } from '../utils/logger'
import { backendConfig, workerConfig } from '../utils/config'
import { createClient } from 'redis'

type ServiceType = 'server' | 'worker'

const getEnvironment = (service: ServiceType) => {
  if (service === 'worker') {
    return workerConfig.getConfig('redisUrl')
  }
  return backendConfig.getConfig('redisUrl')
}

const getLogger = (service: ServiceType) => {
  if (service === 'worker') {
    return workerLogger
  }
  return backendLogger
}

export class RedisClient {
  private redisClient
  private EXECUTION_QUEUE_KEY = 'workflow:execution'
  private EXECUTION_QUEUE_MAX_LENGTH = 10000
  private EXECUTION_GROUP = 'workflow:executors'
  private logger
  public LOG_GROUP = '[REDIS]'

  constructor(service: ServiceType) {
    const REDIS_URL = getEnvironment(service)
    const logger = getLogger(service)
    this.redisClient = createClient({ url: REDIS_URL })
    this.logger = logger
    this.redisClient.on('error', (err) => {
      this.logger.error(`${this.LOG_GROUP} Client error`, err)
    })
  }

  async connect() {
    await this.redisClient.connect()
  }

  async xAdd({
    payload,
    streamKey = this.EXECUTION_QUEUE_KEY,
    maxlen = this.EXECUTION_QUEUE_MAX_LENGTH,
  }: {
    payload: Record<string, any>
    streamKey?: string
    maxlen?: number
  }) {
    return this.redisClient.xAdd(streamKey, '*', payload, {
      TRIM: {
        strategy: 'MAXLEN',
        strategyModifier: '~',
        threshold: maxlen,
      },
    })
  }

  async xReadGroup({
    readGroup = this.EXECUTION_GROUP,
    consumerGroup,
    streamKey = this.EXECUTION_QUEUE_KEY,
  }: {
    readGroup?: string
    consumerGroup: string
    streamKey?: string
  }) {
    return this.redisClient.xReadGroup(
      readGroup,
      consumerGroup,
      {
        key: streamKey,
        id: '>',
      },
      {
        BLOCK: 0,
        COUNT: 10,
      },
    )
  }

  async incr(key: string) {
    return this.redisClient.incr(key)
  }

  async decr(key: string) {
    return this.redisClient.decr(key)
  }

  async expire(key: string, ttl: number) {
    return this.redisClient.expire(key, ttl)
  }

  async del(keys: string | string[]) {
    return this.redisClient.del(keys)
  }

  async xAck({
    streamKey = this.EXECUTION_QUEUE_KEY,
    consumerGroup = this.EXECUTION_GROUP,
    messageID,
  }: {
    consumerGroup?: string
    streamKey?: string
    messageID: string
  }) {
    return this.redisClient.xAck(streamKey, consumerGroup, messageID)
  }

  async publish() {}

  async subscribe() {}

  async unsubscribe(channelName?: string[]) {
    if (channelName) {
      return this.redisClient.unsubscribe(...channelName)
    }
    return this.redisClient.unsubscribe()
  }

  async xGroupDestroy({
    streamKey = this.EXECUTION_QUEUE_KEY,
    consumerGroup,
  }: {
    streamKey?: string
    consumerGroup: string
  }) {
    return this.redisClient.xGroupDestroy(streamKey, consumerGroup)
  }

  async cleanup() {
    return this.redisClient.quit()
  }
}
