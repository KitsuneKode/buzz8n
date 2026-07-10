import { describe, test, expect, beforeEach, mock } from 'bun:test'
import express from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { password as Password } from 'bun'

const mockPrismaUserFindUnique = mock(() => Promise.resolve(null))
const mockPrismaUserCreate = mock(() =>
  Promise.resolve({ id: 'user-1', email: 'test@example.com', name: 'Test', password_hash: 'hash' }),
)
const mockLoggerInfo = mock(() => {})

mock.module('@/middlewares/rate-limiter-middleware', () => ({
  rateLimitMiddleware: {
    auth: (_req: unknown, _res: unknown, next: () => void) => next(),
    api: (_req: unknown, _res: unknown, next: () => void) => next(),
  },
}))

mock.module('@/middlewares/auth-middleware', () => ({
  auth: (req: { user?: { userId: string } }, _res: unknown, next: () => void) => {
    req.user = { userId: 'user-1' }
    next()
  },
}))

mock.module('@/utils/config', () => ({
  JWT_SECRET: 'test-jwt-secret',
  NODE_ENV: 'test',
}))

mock.module('@/utils/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mock(() => {}),
  },
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    user: {
      findUnique: mockPrismaUserFindUnique,
      create: mockPrismaUserCreate,
    },
  },
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string
    constructor(message: string, { code }: { code: string }) {
      super(message)
      this.code = code
    }
  },
}))

const { authRouter } = await import('../../../../apps/server/src/routers/auth')

const validPassword = 'SecurePass1!'
const validSignInBody = {
  email: 'user@example.com',
  password: validPassword,
}

async function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)
  return app
}

async function signInRequest(body: Record<string, string> = validSignInBody) {
  const app = await createTestApp()
  const server = app.listen(0)
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  try {
    const response = await fetch(`http://127.0.0.1:${port}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await response.text()
    let json: unknown = null
    try {
      json = JSON.parse(text)
    } catch {
      json = text
    }
    return { status: response.status, body: json, headers: response.headers }
  } finally {
    server.close()
  }
}

describe('auth JWT signing', () => {
  test('jwt.sign with expiresIn produces a token with exp claim', () => {
    const secret = 'fake-secret-for-unit-test'
    const expiresIn = '1h'

    const token = jwt.sign({ email: 'user@example.com', userId: 'user-1' }, secret, {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    })

    const decoded = jwt.decode(token) as jwt.JwtPayload
    expect(decoded.exp).toBeDefined()
    expect(typeof decoded.exp).toBe('number')
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  test('defaults to 7d expiry when JWT_EXPIRES_IN is unset', () => {
    const secret = 'fake-secret-for-unit-test'
    const before = Math.floor(Date.now() / 1000)

    const token = jwt.sign({ email: 'user@example.com', userId: 'user-1' }, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
    })

    const decoded = jwt.decode(token) as jwt.JwtPayload
    const sevenDaysSeconds = 7 * 24 * 60 * 60
    expect(decoded.exp).toBeGreaterThanOrEqual(before + sevenDaysSeconds - 5)
    expect(decoded.exp).toBeLessThanOrEqual(before + sevenDaysSeconds + 5)
  })
})

describe('Auth Router sign-in', () => {
  beforeEach(() => {
    mockPrismaUserFindUnique.mockClear()
    mockLoggerInfo.mockClear()
    delete process.env.COOKIE_DOMAIN
  })

  test('returns 401 with uniform message when user does not exist', async () => {
    mockPrismaUserFindUnique.mockResolvedValueOnce(null)

    const result = await signInRequest()

    expect(result.status).toBe(401)
    expect(result.body).toEqual({ error: 'Invalid email or password' })
  })

  test('returns 401 with uniform message when password is wrong', async () => {
    const passwordHash = await Password.hash(validPassword, {
      algorithm: 'bcrypt',
      cost: 4,
    })

    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: validSignInBody.email,
      password_hash: passwordHash,
    })

    const result = await signInRequest({
      ...validSignInBody,
      password: 'WrongPass1!',
    })

    expect(result.status).toBe(401)
    expect(result.body).toEqual({ error: 'Invalid email or password' })
  })

  test('returns 200 and sets JWT with exp claim on successful sign-in', async () => {
    const passwordHash = await Password.hash(validPassword, {
      algorithm: 'bcrypt',
      cost: 4,
    })

    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: validSignInBody.email,
      password_hash: passwordHash,
    })

    const result = await signInRequest()

    expect(result.status).toBe(200)
    expect(result.body).toBe('Signed in sucessfully')

    const setCookie = result.headers.get('set-cookie')
    expect(setCookie).toContain('buzz8n_auth=')

    const tokenMatch = setCookie?.match(/buzz8n_auth=([^;]+)/)
    expect(tokenMatch).toBeTruthy()

    const decoded = jwt.decode(tokenMatch![1]!) as jwt.JwtPayload
    expect(decoded.email).toBe(validSignInBody.email)
    expect(decoded.userId).toBe('user-1')
    expect(decoded.exp).toBeDefined()
  })

  test('uses COOKIE_DOMAIN env var for sign-in cookie', async () => {
    process.env.COOKIE_DOMAIN = 'auth.example.com'

    const passwordHash = await Password.hash(validPassword, {
      algorithm: 'bcrypt',
      cost: 4,
    })

    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: validSignInBody.email,
      password_hash: passwordHash,
    })

    const result = await signInRequest()

    expect(result.status).toBe(200)
    const setCookie = result.headers.get('set-cookie')
    expect(setCookie).toContain('Domain=auth.example.com')
  })

  test('cookie Max-Age matches JWT_EXPIRES_IN', async () => {
    process.env.JWT_EXPIRES_IN = '1h'

    const passwordHash = await Password.hash(validPassword, {
      algorithm: 'bcrypt',
      cost: 4,
    })

    mockPrismaUserFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: validSignInBody.email,
      password_hash: passwordHash,
    })

    const result = await signInRequest()

    expect(result.status).toBe(200)
    const setCookie = result.headers.get('set-cookie')
    expect(setCookie).toContain('Max-Age=3600')

    delete process.env.JWT_EXPIRES_IN
  })
})
