import { RedisClient } from '.'

const redis = new RedisClient('worker')
await redis.connect()

async function flushDatabase() {
  try {
    const result = await redis.flushdb()
    console.info('FLUSHDB result:', result) // Should log 'OK'
  } catch (err) {
    console.error('Error flushing current database:', err)
  } finally {
    await redis.cleanup()
  }
}

await flushDatabase()
