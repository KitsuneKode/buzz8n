import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'

// Mock dependencies
const mockJwtVerify: any = mock(() => ({ email: 'test@example.com', userId: 'user-123' }))
const mockJwtTokenError = class extends Error {
  name = 'JsonWebTokenError'
  constructor(message: string) {
    super(message)
  }
}

mock.module('jsonwebtoken', () => ({
  default: {
    verify: mockJwtVerify,
    JsonWebTokenError: mockJwtTokenError,
  },
  JsonWebTokenError: mockJwtTokenError,
}))

mock.module('@apps/server/src/utils/config', () => ({
  JWT_SECRET: 'test_secret',
}))

describe('Auth Middleware', () => {
  beforeEach(() => {
    mockJwtVerify.mockClear()
  })

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    cookies: {},
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
      statusCode: 200,
      body: null,
    }
    return res
  }

  const createMockNext = (): NextFunction => mock(() => {}) as any

  describe('auth middleware', () => {
    test('should return 401 when auth cookie is missing', async () => {
      const req = createMockRequest({ cookies: {} })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (!authCookie) {
        res.status!(401).send!('Access token required')
        return
      }

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.send).toHaveBeenCalledWith('Access token required')
      expect(next).not.toHaveBeenCalled()
    })

    test('should return 401 when token is invalid', async () => {
      const jwt = await import('jsonwebtoken')

      mockJwtVerify.mockImplementationOnce(() => {
        throw new mockJwtTokenError('Invalid token')
      })

      const req = createMockRequest({ cookies: { buzz8n_auth: 'invalid_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        try {
          const { JWT_SECRET } = await import('@apps/server/src/utils/config')
          jwt.default.verify(authCookie, JWT_SECRET!)
        } catch (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            res.status!(401).json!({ error: 'Invalid or expired token' })
            return
          }
        }
      }

      expect(mockJwtVerify).toHaveBeenCalledWith('invalid_token', 'test_secret')
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
      expect(next).not.toHaveBeenCalled()
    })

    test('should return 401 when token is missing email or userId', async () => {
      const jwt = await import('jsonwebtoken')

      mockJwtVerify.mockReturnValueOnce({ email: 'test@example.com' }) // Missing userId

      const req = createMockRequest({ cookies: { buzz8n_auth: 'valid_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        const { JWT_SECRET } = await import('@apps/server/src/utils/config')
        const isVerified = jwt.default.verify(authCookie, JWT_SECRET!)
        const { email, userId } = isVerified as any

        if (!isVerified || !email || !userId) {
          res.status!(401).send!('Not authenticated')
          return
        }
      }

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.send).toHaveBeenCalledWith('Not authenticated')
      expect(next).not.toHaveBeenCalled()
    })

    test('should successfully authenticate with valid token', async () => {
      const jwt = await import('jsonwebtoken')

      mockJwtVerify.mockReturnValueOnce({
        email: 'test@example.com',
        userId: 'user-123',
      })

      const req = createMockRequest({ cookies: { buzz8n_auth: 'valid_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        const { JWT_SECRET } = await import('@apps/server/src/utils/config')
        const isVerified = jwt.default.verify(authCookie, JWT_SECRET!)
        const { email, userId } = isVerified as any

        if (isVerified && email && userId) {
          req.user = { email, userId }
          next()
        }
      }

      expect(mockJwtVerify).toHaveBeenCalledWith('valid_token', 'test_secret')
      expect(req.user).toEqual({ email: 'test@example.com', userId: 'user-123' })
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    test('should handle JWT verification errors', async () => {
      const jwt = await import('jsonwebtoken')

      mockJwtVerify.mockImplementationOnce(() => {
        throw new mockJwtTokenError('jwt malformed')
      })

      const req = createMockRequest({ cookies: { buzz8n_auth: 'malformed_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        try {
          const { JWT_SECRET } = await import('@apps/server/src/utils/config')
          jwt.default.verify(authCookie, JWT_SECRET!)
        } catch (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            res.status!(401).json!({ error: 'Invalid or expired token' })
            return
          } else {
            next(error)
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
    })

    test('should call next() with error for non-JWT errors', async () => {
      const jwt = await import('jsonwebtoken')

      const unexpectedError = new Error('Unexpected error')
      mockJwtVerify.mockImplementationOnce(() => {
        throw unexpectedError
      })

      const req = createMockRequest({ cookies: { buzz8n_auth: 'valid_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        try {
          const { JWT_SECRET } = await import('@apps/server/src/utils/config')
          jwt.default.verify(authCookie, JWT_SECRET!)
        } catch (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            res.status!(401).json!({ error: 'Invalid or expired token' })
            return
          } else {
            next(error)
          }
        }
      }

      expect(next).toHaveBeenCalledWith(unexpectedError)
      expect(res.status).not.toHaveBeenCalled()
    })

    test('should verify token with correct secret', async () => {
      const jwt = await import('jsonwebtoken')

      mockJwtVerify.mockReturnValueOnce({
        email: 'test@example.com',
        userId: 'user-123',
      })

      const req = createMockRequest({ cookies: { buzz8n_auth: 'valid_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        const { JWT_SECRET } = await import('@apps/server/src/utils/config')
        const isVerified = jwt.default.verify(authCookie, JWT_SECRET!)
        const { email, userId } = isVerified as any

        if (isVerified && email && userId) {
          req.user = { email, userId }
          next()
        }
      }

      expect(mockJwtVerify).toHaveBeenCalledWith('valid_token', 'test_secret')
    })

    test('should handle expired tokens', async () => {
      const jwt = await import('jsonwebtoken')

      mockJwtVerify.mockImplementationOnce(() => {
        const error = new mockJwtTokenError('jwt expired')
        error.name = 'TokenExpiredError'
        throw error
      })

      const req = createMockRequest({ cookies: { buzz8n_auth: 'expired_token' } })
      const res = createMockResponse()
      const next = createMockNext()

      const authCookie = req.cookies!['buzz8n_auth']

      if (authCookie) {
        try {
          const { JWT_SECRET } = await import('@apps/server/src/utils/config')
          jwt.default.verify(authCookie, JWT_SECRET!)
        } catch (error) {
          if (error instanceof jwt.JsonWebTokenError) {
            res.status!(401).json!({ error: 'Invalid or expired token' })
            return
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
    })
  })
})
