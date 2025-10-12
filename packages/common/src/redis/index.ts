import { backendConfig } from '../utils/config-loader'
import { createClient } from 'redis'

const REDIS_URL = backendConfig.getConfig('redisUrl')

export const redis = createClient({ url: REDIS_URL })
