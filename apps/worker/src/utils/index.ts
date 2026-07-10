import { workerConfig as config } from '@buzz8n/backend-common/config'
export { workerLogger as logger } from '@buzz8n/backend-common/logger'

export const REDIS_CONSUMER = config.getConfig('redisConsumer')
export const CREDENTIALS_ENCRYPTION_KEY = config.getConfig('credentialsEncryptionKey')

export { config }
export { getDecryptedCredential } from './credentials'
