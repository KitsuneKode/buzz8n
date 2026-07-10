import { JWT_SECRET, NODE_ENV, COOKIE_DOMAIN, JWT_EXPIRES_IN } from '@/utils/config'
import { rateLimitMiddleware } from '@/middlewares/rate-limiter-middleware'
import { signInSchema, signUpSchema, apiError } from '@buzz8n/common/types'
import { PrismaClientKnownRequestError, prisma } from '@buzz8n/store'
import { auth } from '@/middlewares/auth-middleware'
import { password as Password } from 'bun'
import { logger } from '@/utils/logger'
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

function authCookieOptions() {
  const isDev = NODE_ENV === 'development'
  return {
    secure: !isDev,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: (isDev ? 'lax' : 'none') as 'lax' | 'none',
    domain: isDev ? 'localhost' : COOKIE_DOMAIN,
    path: '/',
  }
}

// Apply rate limiting to auth endpoints
router.post('/signup', rateLimitMiddleware.auth, async (req, res, next) => {
  try {
    const validated = signUpSchema.safeParse(req.body)
    if (!validated.success) {
      res.status(422).json(
        apiError('Invalid data', {
          code: 'VALIDATION_ERROR',
          details: validated.error.flatten(),
        }),
      )
      return
    }

    const { email, name, password } = validated.data

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

    if (!user) {
      throw new Error('Unable to create user')
    }

    res.status(201).json({ message: 'Successfully signed up' })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).json(apiError('User with email already exists', { code: 'EMAIL_TAKEN' }))
        return
      }
    }

    next(error)
  }
})

router.post('/signin', rateLimitMiddleware.auth, async (req, res, next) => {
  const validated = signInSchema.safeParse(req.body)

  if (!validated.success) {
    res
      .status(422)
      .json(
        apiError('Invalid data', { code: 'VALIDATION_ERROR', details: validated.error.flatten() }),
      )
    return
  }

  const { email, password } = validated.data

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      logger.info('User with this email does not exist', { email })
      res.status(401).json(apiError('Email or password invalid', { code: 'INVALID_CREDENTIALS' }))
      return
    }

    const passwordMatch = await Password.verify(password, user.password_hash)

    if (!passwordMatch) {
      logger.info('Email or Password Invalid', { email })
      res.status(401).json(apiError('Email or password invalid', { code: 'INVALID_CREDENTIALS' }))
      return
    }

    const userId = user.id
    const token = jwt.sign({ email, userId }, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    })

    res
      .status(200)
      .cookie('buzz8n_auth', token, authCookieOptions())
      .json({ message: 'Signed in successfully' })
  } catch (error) {
    next(error)
  }
})

// Get current user profile
router.get('/me', rateLimitMiddleware.api, auth, async (req, res, next) => {
  try {
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
      res.status(404).json(apiError('User not found', { code: 'NOT_FOUND' }))
      return
    }

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
})

// Sign out user
router.post('/signout', (_req, res) => {
  res
    .status(200)
    .clearCookie('buzz8n_auth', authCookieOptions())
    .json({ message: 'Signed out successfully' })
})

export { router as authRouter }
