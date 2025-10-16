import { createClient } from 'redis'

const redis = await createClient()
  .on('error', (err) => console.error('Redis Client Error', err))
  .connect()

const STREAM_KEY = 'workflow:execution'
const CONSUMER_GROUP = 'workflow:executors'

async function migrate() {
  try {
    const seed = await redis.xGroupCreate(STREAM_KEY, CONSUMER_GROUP, '$', {
      MKSTREAM: true,
    })
    console.log(seed)
  } catch (err: unknown) {
    console.error('seed failed')
    console.error((err as Error).message)
    redis.quit()
    process.exit(1)
  }
  redis.quit()
}

migrate()
