import { backendLogger, workerLogger } from '../utils/logger'
import { backendConfig, workerConfig } from '../utils/config'
import type { ExecutionLog } from '@buzz8n/common/types'
import { createClient } from 'redis'

export type { RedisClientType } from 'redis'

type ServiceType = 'server' | 'worker' | 'ws-server'

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
  // Channel names for different event types
  public readonly CHANNELS = {
    // WORKFLOW_EVENTS: 'workflow:events',
    EXECUTION_EVENTS: 'workflow:execution:events',
  } as const

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  async xGroupCreate({
    streamKey = this.EXECUTION_QUEUE_KEY,
    consumerGroup,
  }: {
    streamKey?: string
    consumerGroup: string
  }) {
    return this.redisClient.xGroupCreate(streamKey, consumerGroup, '$', { MKSTREAM: true })
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

  async publish(channelName: string, message: string) {
    return this.redisClient.publish(channelName, message)
  }

  async duplicate() {
    return this.redisClient.duplicate()
  }

  async destroy() {
    return this.redisClient.destroy()
  }

  // async publishWorkflowEvent(workflowId: string, event: any) {
  //   const channel = `${this.CHANNELS.WORKFLOW_EVENTS}:${workflowId}`
  //   const message = JSON.stringify(event)
  //   await this.publish(channel, message)
  //   this.logger.debug(`${this.LOG_GROUP} Published workflow event`, { channel, message })
  // }

  async publishExecutionEvent(executionId: string, log: ExecutionLog) {
    const channel = `${this.CHANNELS.EXECUTION_EVENTS}:${executionId}`

    const message = JSON.stringify(log)
    await this.publish(channel, message)
    this.logger.debug(`${this.LOG_GROUP} Published execution event`, { channel })
  }
  // async subscribe(channelName: string, callback: (message: string) => void) {
  //   return this.redisClient.subscribe(channelName, callback)
  // }
  //
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

  // Rate limiting methods
  async zAdd(key: string, score: number, member: string) {
    return this.redisClient.zAdd(key, { score, value: member })
  }

  async zCard(key: string) {
    return this.redisClient.zCard(key)
  }

  async zRemRangeByScore(key: string, min: number, max: number) {
    return this.redisClient.zRemRangeByScore(key, min, max)
  }

  async sAdd(key: string, ...members: string[]) {
    return this.redisClient.sAdd(key, members)
  }

  async sRem(key: string, ...members: string[]) {
    return this.redisClient.sRem(key, members)
  }

  async sCard(key: string) {
    return this.redisClient.sCard(key)
  }

  async keys(pattern: string) {
    return this.redisClient.keys(pattern)
  }
}
