import { backendLogger, workerLogger, wsServerLogger } from './logger'
import { ConfigLoader } from '@buzz8n/common/config'

const backendConfigSchema = {
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  port: () => process.env.PORT,
  jwtSecret: () => process.env.JWT_SECRET,
  jwtExpiresIn: () => process.env.JWT_EXPIRES_IN ?? '7d',
  credentialsEncryptionKey: () => process.env.CREDENTIALS_ENCRYPTION_KEY,
  allowedOrigins: () => process.env.ALLOWED_ORIGINS,
  redisUrl: () => process.env.REDIS_URL,
}
const workerSchema = {
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  redisUrl: () => process.env.REDIS_URL,
  credentialsEncryptionKey: () => process.env.CREDENTIALS_ENCRYPTION_KEY,
  redisConsumer: () => `worker-${process.pid}`,
}

const wsServerSchema = {
  port: () => process.env.PORT,
  jwtSecret: () => process.env.JWT_SECRET,
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  redisUrl: () => process.env.REDIS_URL,
}

export const backendConfig = ConfigLoader.getInstance(backendConfigSchema, 'server', backendLogger)
export const workerConfig = ConfigLoader.getInstance(workerSchema, 'worker', workerLogger)
export const wsServerConfig = ConfigLoader.getInstance(wsServerSchema, 'ws-server', wsServerLogger)
