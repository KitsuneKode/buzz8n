#!/usr/bin/env bun
/**
 * Ensures Redis consumer group exists, then starts the worker (src in dev, dist in prod).
 */
import { RedisClient } from '@buzz8n/backend-common/redis'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const redis = new RedisClient('worker')

async function ensureGroup() {
  await redis.connect()
  try {
    await redis.xGroupCreate()
    console.info('[entrypoint] Created consumer group workflow:executors')
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? String(err)
    if (msg.includes('BUSYGROUP')) {
      console.info('[entrypoint] Consumer group already exists')
    } else {
      console.error('[entrypoint] Failed to create consumer group', msg)
      process.exit(1)
    }
  } finally {
    await redis.cleanup()
  }
}

await ensureGroup()

const distEntry = join(import.meta.dir, '../dist/index.js')
const srcEntry = join(import.meta.dir, '../src/index.ts')
const entry = existsSync(distEntry) ? distEntry : srcEntry
await import(entry)
