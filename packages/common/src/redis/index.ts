import { backendConfig, workerConfig } from '../utils/config-loader'
import { createClient } from 'redis'

type ServiceType = 'server' | 'worker'

const getEnvironment = (service: ServiceType) => {
  if (service == 'worker') {
    return workerConfig.getConfig('redisUrl')
  } else {
    return backendConfig.getConfig('redisUrl')
  }
}

export const redisClient = (service: ServiceType) => {
  const REDIS_URL = getEnvironment(service)
  return createClient({ url: REDIS_URL })
}
