import { signInSchema, signUpSchema, validate } from '@buzz8n/common/types'
import { PrismaClientKnownRequestError } from '@buzz8n/store'
import { JWT_SECRET } from '@/utils/config'
import { prisma } from '@buzz8n/store'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = Router()

router.post('/sign-up', async (req, res) => {
  //TODO: add zod parsing

  const validated = signUpSchema.safeParse(req.body)
  if (!validated.success) {
    res.status(422).json({ error: 'Invalid data' })
    return
  }

  const { email, name, password } = validated.data

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password_hash: passwordHash,
      },
    })

    if (!user) {
      res.send('INTERNAL SERVER ERROR').status(500)
      return
    } else {
      res.send('Sucessfully created the user').status(201)
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.send('User with email already exists').status(409)
      return
    }

    res.send('INTERNAL SERVER ERROR').status(500)
  }
})

router.post('/sign-in', async (req, res) => {
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
      res.send('User with this email doesnot exist').status(400)
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      res.send('Email or Password Invalid').status(400)
      return
    }

    const token = jwt.sign(email, JWT_SECRET!)

    res.status(200).json({
      token,
      message: 'Signed up sucessfully',
    })
  } catch (error) { }
})

export { router as authRouter }
