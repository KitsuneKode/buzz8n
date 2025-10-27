import { auth } from '@/middlewares/auth-middleware'
import type { Request, Response } from 'express'
import { logger } from '@/utils/logger'
import { Router } from 'express'
import { redis } from '@/redis'

const router = Router()

// Simple rate limit status endpoint
router.get('/rate-limits/status', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId

    // Get basic rate limit info
    const status = {
      user: {
        api: await getRateLimitStatus(`rate:user:${userId}`, 'api'),
        list: await getRateLimitStatus(`rate:user:${userId}`, 'list'),
      },
      ip: {
        auth: await getRateLimitStatus(`rate:ip:${req.ip}`, 'auth'),
      },
    }

    res.json(status)
  } catch (error) {
    logger.error('Failed to get rate limit status', { error })
    res.status(500).json({ error: 'Failed to get rate limit status' })
  }
})

// Helper function to get rate limit status
async function getRateLimitStatus(key: string, type: 'api' | 'list' | 'auth') {
  try {
    const configs = {
      api: { windowMs: 60 * 60 * 1000, maxRequests: 1000 },
      list: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
      auth: { windowMs: 60 * 1000, maxRequests: 10 },
    }

    const config = configs[type]
    const now = Date.now()
    const windowStart = now - config.windowMs

    await redis.zRemRangeByScore(key, 0, windowStart)
    const count = await redis.zCard(key)

    return {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime: now + config.windowMs,
    }
  } catch (error) {
    return { limit: 0, remaining: 0, resetTime: Date.now() }
  }
}

export { router as rateLimitStatusRouter }
