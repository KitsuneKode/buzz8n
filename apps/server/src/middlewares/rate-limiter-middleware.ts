import type { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { redis } from '@/redis'

const FAIL_OPEN = process.env.RATE_LIMIT_FAIL_OPEN !== 'false'

// Simple rate limit configuration
export const RATE_LIMITS = {
  // Auth endpoints - prevent brute force
  auth: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute

  // Execution endpoints - prevent resource abuse
  execution: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute

  // Webhook endpoints - prevent spam
  webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute

  // Standard API - normal usage
  api: { windowMs: 60 * 60 * 1000, maxRequests: 1000 }, // 1000 per hour

  // List endpoints - prevent expensive queries
  list: { windowMs: 60 * 60 * 1000, maxRequests: 500 }, // 500 per hour
}

// Simple key generators
const getKey = (req: Request, type: string) => {
  if (type === 'auth') return `rate:auth:${req.ip}`
  if (type === 'webhook') return `rate:webhook:${req.params.webhookPath ?? req.ip}`
  if (type === 'execution') return `rate:execution:${req.params.id}`
  if (req.user?.userId) return `rate:user:${req.user.userId}`
  return `rate:ip:${req.ip}`
}

// Simple sliding window rate limiter using Redis
async function checkRateLimit(key: string, config: typeof RATE_LIMITS.auth) {
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Clean old entries and count current
    await redis.zRemRangeByScore(key, 0, windowStart)
    const count = await redis.zCard(key)

    if (count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: now + config.windowMs }
    }

    // Add current request
    await redis.zAdd(key, now, `${now}-${Math.random()}`)
    await redis.expire(key, Math.ceil(config.windowMs / 1000))

    return {
      allowed: true,
      remaining: config.maxRequests - count - 1,
      resetTime: now + config.windowMs,
    }
  } catch (error) {
    logger.error('Rate limit check failed', { key, error })
    if (!FAIL_OPEN) {
      return { allowed: false, remaining: 0, resetTime: now + config.windowMs }
    }
    return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs }
  }
}

// Simple rate limit middleware factory
export function createRateLimit(type: keyof typeof RATE_LIMITS) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = getKey(req, type)
      const config = RATE_LIMITS[type]
      const result = await checkRateLimit(key, config)

      // Set headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      })

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
        res.set('Retry-After', retryAfter.toString())

        logger.warn('Rate limit exceeded', { key, type, ip: req.ip, userId: req.user?.userId })

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please slow down and try again later.',
          retryAfter,
        })
      }

      next()
    } catch (error) {
      logger.error('Rate limit check failed', { error })
      if (!FAIL_OPEN) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit service unavailable.',
        })
      }
      next()
    }
  }
}

// Pre-configured middleware
export const rateLimitMiddleware = {
  auth: createRateLimit('auth'),
  execution: createRateLimit('execution'),
  webhook: createRateLimit('webhook'),
  api: createRateLimit('api'),
  list: createRateLimit('list'),
}
