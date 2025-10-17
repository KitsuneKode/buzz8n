import { workerConfig as config } from '@buzz8n/backend-common/config'
export { workerLogger as logger } from '@buzz8n/backend-common/logger'

export { config }
export const REDIS_URL = config.getConfig('redisUrl')
