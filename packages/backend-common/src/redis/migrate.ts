import { createClient } from 'redis'

const redis = await createClient()
  .on('error', (err) => console.error('Redis Client Error', err))
  .connect()

const STREAM_KEY = 'workflow:execution'
const CONSUMER_GROUP = 'workflow:executors'

async function migrate() {
  try {
    const seed = await redis.xGroupCreate(STREAM_KEY, CONSUMER_GROUP, '$', { MKSTREAM: true })
    console.log(seed)
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? String(err)
    if (msg.includes('BUSYGROUP')) {
      console.info('Consumer group already exists; skipping creation')
    } else {
      console.error('seed failed')
      console.error(msg)
      await redis.quit()
      process.exit(1)
    }
  } finally {
    await redis.quit()
  }
}

migrate()
