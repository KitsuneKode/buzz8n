import { backendLogger, workerLogger } from './logger'
import { ConfigLoader } from '@buzz8n/common/config'

const backendConfigSchema = {
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  port: () => process.env.PORT,
  jwtSecret: () => process.env.JWT_SECRET,
  allowedOrigins: () => process.env.ALLOWED_ORIGINS,
  redisUrl: () => process.env.REDIS_URL,
}
const workerSchema = {
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  redisUrl: () => process.env.REDIS_URL,
  redisConsumerGroup: () => `worker-${process.pid}`,
}

export const backendConfig = ConfigLoader.getInstance(backendConfigSchema, 'server', backendLogger)
export const workerConfig = ConfigLoader.getInstance(workerSchema, 'worker', workerLogger)
