import { signInSchema, signUpSchema } from '@buzz8n/common/types'
import { PrismaClientKnownRequestError } from '@buzz8n/store'
import { JWT_SECRET } from '@/utils/config'
import { password as Password } from 'bun'
import { prisma } from '@buzz8n/store'
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/sign-up', async (req, res, next) => {
  try {
    const validated = signUpSchema.safeParse(req.body)
    if (!validated.success) {
      res.status(422).json({ error: 'Invalid data' })
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
      res.status(500).send('INTERNAL SERVER ERROR')
      return
    }

    res.status(201).send('Sucessfully created the user')
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

router.post('/sign-in', async (req, res, next) => {
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
      res.status(400).send('User with this email doesnot exist')
      return
    }

    const passwordMatch = await Password.verify(password, user.password_hash)

    if (!passwordMatch) {
      res.status(400).send('Email or Password Invalid')

      return
    }

    const token = jwt.sign({ email }, JWT_SECRET!)

    res.status(200).json({
      token,
      message: 'Signed up sucessfully',
    })
  } catch (error) {
    next(error)
  }
})

export { router as authRouter }
