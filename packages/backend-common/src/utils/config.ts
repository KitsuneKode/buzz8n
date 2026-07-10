import { backendLogger, workerLogger, wsServerLogger } from './logger'
import { ConfigLoader } from '@buzz8n/common/config'

const backendConfigSchema = {
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  port: () => process.env.PORT,
  jwtSecret: () => process.env.JWT_SECRET,
  allowedOrigins: () => process.env.ALLOWED_ORIGINS,
  redisUrl: () => process.env.REDIS_URL,
  credentialsEncryptionKey: () => process.env.CREDENTIALS_ENCRYPTION_KEY,
  cookieDomain: () => process.env.COOKIE_DOMAIN || 'localhost',
  jwtExpiresIn: () => process.env.JWT_EXPIRES_IN || '7d',
}
const workerSchema = {
  nodeEnv: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  redisUrl: () => process.env.REDIS_URL,
  redisConsumer: () => `worker-${process.pid}`,
  credentialsEncryptionKey: () => process.env.CREDENTIALS_ENCRYPTION_KEY,
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
