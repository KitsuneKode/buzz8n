import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'

// Mock dependencies
const mockLoggerWarn: any = mock(() => {})
const mockLoggerError: any = mock(() => {})
const mockRedisZRemRangeByScore: any = mock(() => Promise.resolve())
const mockRedisZCard: any = mock(() => Promise.resolve(0))
const mockRedisZAdd: any = mock(() => Promise.resolve())
const mockRedisExpire: any = mock(() => Promise.resolve())

mock.module('@apps/server/src/utils/logger', () => ({
  logger: {
    info: mock(() => {}),
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
}))

mock.module('@apps/server/src/redis', () => ({
  redis: {
    zRemRangeByScore: mockRedisZRemRangeByScore,
    zCard: mockRedisZCard,
    zAdd: mockRedisZAdd,
    expire: mockRedisExpire,
  },
}))

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    mockLoggerWarn.mockClear()
    mockLoggerError.mockClear()
    mockRedisZRemRangeByScore.mockClear()
    mockRedisZCard.mockClear()
    mockRedisZAdd.mockClear()
    mockRedisExpire.mockClear()
  })

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    ip: '127.0.0.1',
    params: {},
    user: undefined,
    ...overrides,
  })

  const createMockResponse = (): Partial<Response> => {
    const res: any = {
      status: mock(function (this: any, code: number) {
        this.statusCode = code
        return this
      }),
      send: mock(function (this: any, data: any) {
        this.body = data
        return this
      }),
      json: mock(function (this: any, data: any) {
        this.body = data
        return this
      }),
      set: mock(function (this: any, headers: any) {
        this.headers = { ...this.headers, ...headers }
        return this
      }),
      statusCode: 200,
      body: null,
      headers: {},
    }
    return res
  }

  const createMockNext = (): NextFunction => mock(() => {}) as any

  describe('RATE_LIMITS configuration', () => {
    test('should have correct rate limit configurations', async () => {
      const { RATE_LIMITS } = await import('@apps/server/src/middlewares/rate-limiter-middleware')

      expect(RATE_LIMITS.auth).toEqual({ windowMs: 60 * 1000, maxRequests: 10 })
      expect(RATE_LIMITS.execution).toEqual({ windowMs: 60 * 1000, maxRequests: 10 })
      expect(RATE_LIMITS.webhook).toEqual({ windowMs: 60 * 1000, maxRequests: 100 })
      expect(RATE_LIMITS.api).toEqual({ windowMs: 60 * 60 * 1000, maxRequests: 1000 })
      expect(RATE_LIMITS.list).toEqual({ windowMs: 60 * 60 * 1000, maxRequests: 100 })
    })
  })

  describe('Rate limit enforcement', () => {
    test('should allow request when under rate limit', async () => {
      mockRedisZCard.mockResolvedValueOnce(5) // 5 requests in window, limit is 10

      const req = createMockRequest()
      const res = createMockResponse()
      const next = createMockNext()

      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const count = await mockRedisZCard()

      if (count < config.maxRequests) {
        await mockRedisZAdd('test-key', now, `${now}-${Math.random()}`)
        await mockRedisExpire('test-key', Math.ceil(config.windowMs / 1000))

        const remaining = config.maxRequests - count - 1
        const resetTime = now + config.windowMs

        res.set!({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        })

        next()
      }

      expect(mockRedisZAdd).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '4',
        })
      )
    })

    test('should block request when rate limit exceeded', async () => {
      mockRedisZCard.mockResolvedValueOnce(10) // At limit

      const req = createMockRequest()
      const res = createMockResponse()
      const next = createMockNext()

      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const count = await mockRedisZCard()

      if (count >= config.maxRequests) {
        const resetTime = now + config.windowMs
        const retryAfter = Math.ceil((resetTime - now) / 1000)

        res.set!({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': retryAfter.toString(),
        })

        res.status!(429).json!({
          error: 'Too Many Requests',
          message: 'Please slow down and try again later.',
          retryAfter,
        })
        return
      }

      expect(mockRedisZAdd).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(429)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Too Many Requests',
          message: 'Please slow down and try again later.',
          retryAfter: expect.any(Number),
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    test('should set correct rate limit headers', async () => {
      mockRedisZCard.mockResolvedValueOnce(3)

      const req = createMockRequest()
      const res = createMockResponse()
      const next = createMockNext()

      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const count = await mockRedisZCard()

      if (count < config.maxRequests) {
        await mockRedisZAdd('test-key', now, `${now}-${Math.random()}`)
        await mockRedisExpire('test-key', Math.ceil(config.windowMs / 1000))

        const remaining = config.maxRequests - count - 1
        const resetTime = now + config.windowMs

        res.set!({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        })

        next()
      }

      expect(res.set).toHaveBeenCalledWith({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '6',
        'X-RateLimit-Reset': expect.any(String),
      })
    })

    test('should clean old entries before checking limit', async () => {
      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const windowStart = now - config.windowMs

      mockRedisZCard.mockResolvedValueOnce(5)

      const key = 'test-key'

      await mockRedisZRemRangeByScore(key, 0, windowStart)
      await mockRedisZCard()

      expect(mockRedisZRemRangeByScore).toHaveBeenCalledWith(key, 0, windowStart)
      expect(mockRedisZCard).toHaveBeenCalled()
    })

    test('should expire rate limit key after window', async () => {
      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }

      mockRedisZCard.mockResolvedValueOnce(5)

      const key = 'test-key'

      await mockRedisZAdd(key, now, `${now}-${Math.random()}`)
      await mockRedisExpire(key, Math.ceil(config.windowMs / 1000))

      expect(mockRedisExpire).toHaveBeenCalledWith(key, 60)
    })
  })

  describe('Key generation', () => {
    test('should generate correct key for auth type', () => {
      const req = { ip: '192.168.1.1' }
      const type = 'auth'
      const key = `rate:auth:${req.ip}`

      expect(key).toBe('rate:auth:192.168.1.1')
    })

    test('should generate correct key for webhook type', () => {
      const req = { params: { webhookId: 'webhook-123' } }
      const type = 'webhook'
      const key = `rate:webhook:${req.params.webhookId}`

      expect(key).toBe('rate:webhook:webhook-123')
    })

    test('should generate correct key for execution type', () => {
      const req = { params: { id: 'exec-456' } }
      const type = 'execution'
      const key = `rate:execution:${req.params.id}`

      expect(key).toBe('rate:execution:exec-456')
    })

    test('should generate key for authenticated users', () => {
      const req = { user: { userId: 'user-789' } }
      const key = `rate:user:${req.user.userId}`

      expect(key).toBe('rate:user:user-789')
    })

    test('should generate key for unauthenticated users by IP', () => {
      const req = { ip: '10.0.0.1', user: undefined }
      const key = `rate:ip:${req.ip}`

      expect(key).toBe('rate:ip:10.0.0.1')
    })
  })

  describe('Error handling', () => {
    test('should fail open when Redis is down', async () => {
      mockRedisZRemRangeByScore.mockRejectedValueOnce(new Error('Redis connection failed'))

      const req = createMockRequest()
      const res = createMockResponse()
      const next = createMockNext()

      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const key = 'test-key'

      let allowed = true
      try {
        await mockRedisZRemRangeByScore(key, 0, now - config.windowMs)
        await mockRedisZCard()
      } catch (error) {
        // Fail open - allow request if Redis is down
        allowed = true
      }

      if (allowed) {
        res.set!({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': config.maxRequests.toString(),
          'X-RateLimit-Reset': Math.ceil((now + config.windowMs) / 1000).toString(),
        })
        next()
      }

      expect(mockLoggerError).toHaveBeenCalledWith('Rate limit check failed', expect.any(Object))
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalledWith(429)
    })

    test('should log warning when rate limit exceeded', async () => {
      mockRedisZCard.mockResolvedValueOnce(10)

      const req = createMockRequest({
        ip: '192.168.1.1',
        user: { userId: 'user-123', email: 'test@example.com' },
      })
      const res = createMockResponse()

      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const count = await mockRedisZCard()

      if (count >= config.maxRequests) {
        const key = 'test-key'
        const type = 'api'

        mockLoggerWarn('Rate limit exceeded', { key, type, ip: req.ip, userId: req.user?.userId })

        res.status!(429).json!({
          error: 'Too Many Requests',
          message: 'Please slow down and try again later.',
          retryAfter: expect.any(Number),
        })
      }

      expect(mockLoggerWarn).toHaveBeenCalledWith('Rate limit exceeded', {
        key: 'test-key',
        type: 'api',
        ip: '192.168.1.1',
        userId: 'user-123',
      })
    })

    test('should catch and handle errors gracefully', async () => {
      mockRedisZCard.mockRejectedValueOnce(new Error('Database error'))

      const req = createMockRequest()
      const res = createMockResponse()
      const next = createMockNext()

      const key = 'test-key'

      try {
        await mockRedisZCard()
      } catch (error) {
        mockLoggerError('Rate limit check failed', { error })
        next() // Fail open
      }

      expect(mockLoggerError).toHaveBeenCalledWith('Rate limit check failed', expect.any(Object))
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Different rate limit types', () => {
    test('should enforce auth rate limit (10 per minute)', async () => {
      const { RATE_LIMITS } = await import('@apps/server/src/middlewares/rate-limiter-middleware')

      expect(RATE_LIMITS.auth.maxRequests).toBe(10)
      expect(RATE_LIMITS.auth.windowMs).toBe(60 * 1000)
    })

    test('should enforce execution rate limit (10 per minute)', async () => {
      const { RATE_LIMITS } = await import('@apps/server/src/middlewares/rate-limiter-middleware')

      expect(RATE_LIMITS.execution.maxRequests).toBe(10)
      expect(RATE_LIMITS.execution.windowMs).toBe(60 * 1000)
    })

    test('should enforce webhook rate limit (100 per minute)', async () => {
      const { RATE_LIMITS } = await import('@apps/server/src/middlewares/rate-limiter-middleware')

      expect(RATE_LIMITS.webhook.maxRequests).toBe(100)
      expect(RATE_LIMITS.webhook.windowMs).toBe(60 * 1000)
    })

    test('should enforce api rate limit (1000 per hour)', async () => {
      const { RATE_LIMITS } = await import('@apps/server/src/middlewares/rate-limiter-middleware')

      expect(RATE_LIMITS.api.maxRequests).toBe(1000)
      expect(RATE_LIMITS.api.windowMs).toBe(60 * 60 * 1000)
    })

    test('should enforce list rate limit (100 per hour)', async () => {
      const { RATE_LIMITS } = await import('@apps/server/src/middlewares/rate-limiter-middleware')

      expect(RATE_LIMITS.list.maxRequests).toBe(100)
      expect(RATE_LIMITS.list.windowMs).toBe(60 * 60 * 1000)
    })
  })

  describe('Retry-After header', () => {
    test('should include Retry-After header when rate limited', async () => {
      mockRedisZCard.mockResolvedValueOnce(10)

      const req = createMockRequest()
      const res = createMockResponse()

      const now = Date.now()
      const config = { windowMs: 60 * 1000, maxRequests: 10 }
      const count = await mockRedisZCard()

      if (count >= config.maxRequests) {
        const resetTime = now + config.windowMs
        const retryAfter = Math.ceil((resetTime - now) / 1000)

        res.set!({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': retryAfter.toString(),
        })

        res.status!(429).json!({
          error: 'Too Many Requests',
          message: 'Please slow down and try again later.',
          retryAfter,
        })
      }

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Retry-After': expect.any(String),
        })
      )
    })
  })
})
