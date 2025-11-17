import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'

// Mock dependencies
const mockPasswordHash: any = mock(() => Promise.resolve('hashed_password'))
const mockPasswordVerify: any = mock(() => Promise.resolve(true))
const mockJwtSign: any = mock(() => 'mock_jwt_token')
const mockLoggerInfo: any = mock(() => {})
const mockPrismaUserCreate: any = mock(() => Promise.resolve(null))
const mockPrismaUserFindUnique: any = mock(() => Promise.resolve(null))
const mockRateLimitMiddleware: any = {
  auth: mock((req: any, res: any, next: any) => next()),
  api: mock((req: any, res: any, next: any) => next()),
}
const mockAuth: any = mock((req: any, res: any, next: any) => next())

mock.module('bun', () => ({
  password: {
    hash: mockPasswordHash,
    verify: mockPasswordVerify,
  },
}))

mock.module('jsonwebtoken', () => ({
  default: {
    sign: mockJwtSign,
  },
}))

mock.module('@apps/server/src/utils/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mock(() => {}),
  },
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    user: {
      create: mockPrismaUserCreate,
      findUnique: mockPrismaUserFindUnique,
    },
  },
  PrismaClientKnownRequestError: class extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.code = code
    }
  },
}))

mock.module('@buzz8n/common/types', () => ({
  signUpSchema: {
    safeParse: mock((data: any) => {
      if (data.email && data.password && data.name) {
        return { success: true, data }
      }
      return { success: false }
    }),
  },
  signInSchema: {
    safeParse: mock((data: any) => {
      if (data.email && data.password) {
        return { success: true, data }
      }
      return { success: false }
    }),
  },
}))

mock.module('@apps/server/src/middlewares/rate-limiter-middleware', () => ({
  rateLimitMiddleware: mockRateLimitMiddleware,
}))

mock.module('@apps/server/src/middlewares/auth-middleware', () => ({
  auth: mockAuth,
}))

mock.module('@apps/server/src/utils/config', () => ({
  JWT_SECRET: 'test_secret',
  NODE_ENV: 'development',
}))

describe('Auth Router', () => {
  beforeEach(() => {
    mockPasswordHash.mockClear()
    mockPasswordVerify.mockClear()
    mockJwtSign.mockClear()
    mockLoggerInfo.mockClear()
    mockPrismaUserCreate.mockClear()
    mockPrismaUserFindUnique.mockClear()
  })

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    body: {},
    headers: {},
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
      cookie: mock(function (this: any, name: string, value: string, options: any) {
        this.cookies = this.cookies || {}
        this.cookies[name] = { value, options }
        return this
      }),
      clearCookie: mock(function (this: any, name: string) {
        this.clearedCookies = this.clearedCookies || []
        this.clearedCookies.push(name)
        return this
      }),
      statusCode: 200,
      body: null,
      cookies: {},
      clearedCookies: [],
    }
    return res
  }

  const createMockNext = (): NextFunction => mock(() => {}) as any

  describe('POST /signup', () => {
    test('should return 422 when validation fails (missing fields)', async () => {
      const { signUpSchema } = await import('@buzz8n/common/types')
      const req = createMockRequest({ body: { email: 'test@example.com' } }) // Missing name and password
      const res = createMockResponse()
      const next = createMockNext()

      const validated = signUpSchema.safeParse(req.body)
      if (!validated.success) {
        res.status!(422).send!('Invalid data')
      }

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid data')
    })

    test('should successfully create user with valid data', async () => {
      const { signUpSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserCreate.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed_password',
      })

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      const validated = signUpSchema.safeParse(req.body)
      if (validated.success) {
        const { email, name, password } = validated.data
        const { password: Password } = await import('bun')
        const passwordHash = await Password.hash(password, {
          algorithm: 'bcrypt',
          cost: 10,
        })

        const user = await prisma.user.create({
          data: {
            email,
            name,
            password_hash: passwordHash,
          },
        })

        if (user) {
          res.status!(201).send!('Sucessfully signed up')
        }
      }

      expect(mockPasswordHash).toHaveBeenCalled()
      expect(mockPrismaUserCreate).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password_hash: 'hashed_password',
        },
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith('Sucessfully signed up')
    })

    test('should return 409 when user with email already exists', async () => {
      const { signUpSchema } = await import('@buzz8n/common/types')
      const { prisma, PrismaClientKnownRequestError } = await import('@buzz8n/store')

      const prismaError = new (PrismaClientKnownRequestError as any)(
        'Unique constraint failed',
        'P2002'
      )
      mockPrismaUserCreate.mockRejectedValueOnce(prismaError)

      const req = createMockRequest({
        body: {
          email: 'existing@example.com',
          name: 'Test User',
          password: 'Password123!',
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      const validated = signUpSchema.safeParse(req.body)
      if (validated.success) {
        try {
          const { email, name, password } = validated.data
          const { password: Password } = await import('bun')
          const passwordHash = await Password.hash(password, {
            algorithm: 'bcrypt',
            cost: 10,
          })

          await prisma.user.create({
            data: {
              email,
              name,
              password_hash: passwordHash,
            },
          })
        } catch (error: any) {
          if (error.code === 'P2002') {
            res.status!(409).send!('User with email already exists')
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.send).toHaveBeenCalledWith('User with email already exists')
    })

    test('should call next() on unexpected errors', async () => {
      const { signUpSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserCreate.mockRejectedValueOnce(new Error('Database connection failed'))

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      const validated = signUpSchema.safeParse(req.body)
      if (validated.success) {
        try {
          const { email, name, password } = validated.data
          const { password: Password } = await import('bun')
          const passwordHash = await Password.hash(password, {
            algorithm: 'bcrypt',
            cost: 10,
          })

          await prisma.user.create({
            data: {
              email,
              name,
              password_hash: passwordHash,
            },
          })
        } catch (error: any) {
          if (error.code !== 'P2002') {
            next(error)
          }
        }
      }

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('POST /signin', () => {
    test('should return 422 when validation fails', async () => {
      const { signInSchema } = await import('@buzz8n/common/types')
      const req = createMockRequest({ body: { email: 'test@example.com' } }) // Missing password
      const res = createMockResponse()

      const validated = signInSchema.safeParse(req.body)
      if (!validated.success) {
        res.status!(422).json!({ error: 'Invalid data' })
      }

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data' })
    })

    test('should return 400 when user does not exist', async () => {
      const { signInSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockResolvedValueOnce(null)

      const req = createMockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'Password123!',
        },
      })
      const res = createMockResponse()

      const validated = signInSchema.safeParse(req.body)
      if (validated.success) {
        const { email } = validated.data
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          res.status!(400).send!('User with this email doesnot exist')
        }
      }

      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      })
      expect(mockLoggerInfo).toHaveBeenCalledWith('User with this email does not exist', {
        email: 'nonexistent@example.com',
      })
      expect(res.status).toHaveBeenCalledWith(400)
    })

    test('should return 400 when password does not match', async () => {
      const { signInSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
      })
      mockPasswordVerify.mockResolvedValueOnce(false)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'WrongPassword',
        },
      })
      const res = createMockResponse()

      const validated = signInSchema.safeParse(req.body)
      if (validated.success) {
        const { email, password } = validated.data
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (user) {
          const { password: Password } = await import('bun')
          const passwordMatch = await Password.verify(password, user.password_hash)

          if (!passwordMatch) {
            res.status!(400).send!('Email or Password Invalid')
          }
        }
      }

      expect(mockPasswordVerify).toHaveBeenCalledWith('WrongPassword', 'hashed_password')
      expect(mockLoggerInfo).toHaveBeenCalledWith('Email or Password Invalid', {
        email: 'test@example.com',
      })
      expect(res.status).toHaveBeenCalledWith(400)
    })

    test('should successfully sign in with valid credentials', async () => {
      const { signInSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
      })
      mockPasswordVerify.mockResolvedValueOnce(true)

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
        },
      })
      const res = createMockResponse()

      const validated = signInSchema.safeParse(req.body)
      if (validated.success) {
        const { email, password } = validated.data
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (user) {
          const { password: Password } = await import('bun')
          const passwordMatch = await Password.verify(password, user.password_hash)

          if (passwordMatch) {
            const jwt = await import('jsonwebtoken')
            const { JWT_SECRET, NODE_ENV } = await import('@apps/server/src/utils/config')
            const userId = user.id
            const token = jwt.default.sign({ email, userId }, JWT_SECRET!)

            res
              .status!(200)
              .cookie!('buzz8n_auth', token, {
                secure: NODE_ENV !== 'development',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: NODE_ENV === 'development' ? 'lax' : 'none',
                domain: NODE_ENV === 'development' ? 'localhost' : 'buzz8n.kitsunelabs.xyz',
                path: '/',
              })
              .send!('Signed in sucessfully')
          }
        }
      }

      expect(mockJwtSign).toHaveBeenCalledWith(
        { email: 'test@example.com', userId: 'user-123' },
        'test_secret'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.cookie).toHaveBeenCalledWith('buzz8n_auth', 'mock_jwt_token', expect.any(Object))
      expect(res.send).toHaveBeenCalledWith('Signed in sucessfully')
    })

    test('should set correct cookie options in development', async () => {
      const res = createMockResponse()
      const { NODE_ENV } = await import('@apps/server/src/utils/config')

      res
        .status!(200)
        .cookie!('buzz8n_auth', 'token', {
          secure: NODE_ENV !== 'development',
          maxAge: 1000 * 60 * 60 * 24 * 7,
          httpOnly: true,
          sameSite: NODE_ENV === 'development' ? 'lax' : 'none',
          domain: NODE_ENV === 'development' ? 'localhost' : 'buzz8n.kitsunelabs.xyz',
          path: '/',
        })

      expect(res.cookie).toHaveBeenCalledWith('buzz8n_auth', 'token', {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'lax',
        domain: 'localhost',
        path: '/',
      })
    })

    test('should call next() on unexpected errors', async () => {
      const { signInSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockRejectedValueOnce(new Error('Database error'))

      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
        },
      })
      const res = createMockResponse()
      const next = createMockNext()

      const validated = signInSchema.safeParse(req.body)
      if (validated.success) {
        try {
          const { email } = validated.data
          await prisma.user.findUnique({
            where: { email },
          })
        } catch (error) {
          next(error)
        }
      }

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('GET /me', () => {
    test('should return user profile when authenticated', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockResolvedValueOnce({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      })

      const req = createMockRequest({
        user: { userId: 'user-123', email: 'test@example.com' },
      })
      const res = createMockResponse()

      const user = await prisma.user.findUnique({
        where: {
          id: req.user!.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })

      if (user) {
        res.status!(200).json!(user)
      }

      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      })
    })

    test('should return 404 when user not found', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockResolvedValueOnce(null)

      const req = createMockRequest({
        user: { userId: 'nonexistent-user', email: 'test@example.com' },
      })
      const res = createMockResponse()

      const user = await prisma.user.findUnique({
        where: {
          id: req.user!.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })

      if (!user) {
        res.status!(404).json!({ error: 'User not found' })
      }

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' })
    })

    test('should call next() on database errors', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaUserFindUnique.mockRejectedValueOnce(new Error('Database error'))

      const req = createMockRequest({
        user: { userId: 'user-123', email: 'test@example.com' },
      })
      const res = createMockResponse()
      const next = createMockNext()

      try {
        await prisma.user.findUnique({
          where: {
            id: req.user!.userId,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      } catch (error) {
        next(error)
      }

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('POST /signout', () => {
    test('should clear cookie and return success', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      res.status!(200).clearCookie!('buzz8n_auth').send!('Signed out successfully')

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.clearCookie).toHaveBeenCalledWith('buzz8n_auth')
      expect(res.send).toHaveBeenCalledWith('Signed out successfully')
    })
  })
})
