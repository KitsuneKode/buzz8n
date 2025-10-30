import { RedisClient } from '.'

const redis = new RedisClient('worker')
await redis.connect()

const migrate = async () => {
  try {
    const seed = await redis.xGroupCreate()
    console.info('Successfully created consumer group  =>\n -- workflow:executors -- ', {
      seed,
    })
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? String(err)
    if (msg.includes('BUSYGROUP')) {
      console.info('Consumer group already exists; skipping creation')
    } else {
      console.error('seed failed')
      console.error(msg)
      process.exit(1)
    }
  } finally {
    await redis.cleanup()
  }
}

await migrate()
