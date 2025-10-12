import { logger } from '@/utils'

while (true) {
  try {
    logger.info('worker started')
    await new Promise(() => setTimeout(() => logger.info('10 seconds have passed'), 10000))
  } catch (error) {
    logger.error('worker failed', error)
  }
}
