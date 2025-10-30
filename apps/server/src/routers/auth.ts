import { rateLimitMiddleware } from '@/middlewares/rate-limiter-middleware'
import { PrismaClientKnownRequestError, prisma } from '@buzz8n/store'
import { signInSchema, signUpSchema } from '@buzz8n/common/types'
import { JWT_SECRET, NODE_ENV } from '@/utils/config'
import { auth } from '@/middlewares/auth-middleware'
import { password as Password } from 'bun'
import { logger } from '@/utils/logger'
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

// Apply rate limiting to auth endpoints
router.post('/signup', rateLimitMiddleware.auth, async (req, res, next) => {
  try {
    const validated = signUpSchema.safeParse(req.body)
    if (!validated.success) {
      res.status(422).send('Invalid data')
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

    res.status(201).send('Sucessfully signed up')
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).send('User with email already exists')
        return
      }
    }

    next(error)
  }
})

router.post('/signin', rateLimitMiddleware.auth, async (req, res, next) => {
  const validated = signInSchema.safeParse(req.body)

  if (!validated.success) {
    res.status(422).json({ error: 'Invalid data' })
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
      res.status(400).send('User with this email doesnot exist')
      return
    }

    const passwordMatch = await Password.verify(password, user.password_hash)

    if (!passwordMatch) {
      logger.info('Email or Password Invalid', { email })
      res.status(400).send('Email or Password Invalid')

      return
    }

    const userId = user.id
    const token = jwt.sign({ email, userId }, JWT_SECRET!)

    res
      .status(200)
      .cookie('buzz8n_auth', token, {
        secure: NODE_ENV !== 'development',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'none',
        domain: '.buzz8n.kitsunelabs.xyz',
        path: '/',
      })
      .send('Signed in sucessfully')
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
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
})

// Sign out user
router.post('/signout', (req, res) => {
  res.status(200).clearCookie('buzz8n_auth').send('Signed out successfully')
})

export { router as authRouter }
