import { backendConfig as config } from '@buzz8n/backend-common/config'

export { config }
export const JWT_SECRET = config.getConfig('jwtSecret')
export const DATABASE_URL = config.getConfig('dbUrl')
export const PORT = config.getConfig('port')
export const NODE_ENV = config.getConfig('nodeEnv')
export const ALLOWED_ORIGINS = config.getConfig('allowedOrigins')
export const CREDENTIALS_ENCRYPTION_KEY = config.getConfig('credentialsEncryptionKey')
export const COOKIE_DOMAIN = config.getConfig('cookieDomain')
export const JWT_EXPIRES_IN = config.getConfig('jwtExpiresIn')
export const REDIS_URL = config.getConfig('redisUrl')
