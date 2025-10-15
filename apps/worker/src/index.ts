import { logger } from '@/utils'
import { redis } from './redis'

redis.on('error', (error) => logger.error(`[REDIS]`, error))

async function main() {
  redis.connect()
  logger.info('Worker Started! Beginning processing')
}

main()
