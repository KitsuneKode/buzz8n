import { Router, type NextFunction, type Request, type Response } from 'express'
import { prisma, PrismaClientKnownRequestError } from '@buzz8n/store'
import { credentialSchema } from '@buzz8n/common/types'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'

const router = Router()

router.get('/credential/get', auth, (req, res) => {
  try {
    res.status(200).send(`Sucessfully fetch workflow for ${req.user.email}`)
    return
  } catch (error) { }
  console.log('this')
})

router.post('/credential/create', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isParsed = credentialSchema.safeParse(req.body)

    if (!isParsed.success) {
      logger.error('not parsed')
      console.log(isParsed)

      res.status(422).send('Invalid Data')
      return
    }

    const { platform, data, title } = isParsed.data

    const credential = await prisma.credential.create({
      data: {
        data,
        title,
        platform,
        userId: req.user.userId,
      },
    })

    if (!credential) {
      throw new Error('No credential were created')
    }

    res.status(201).send(`Sucessfully created credentials for ${req.user.email}`)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).send('Credential with that title already exists')
        return
      }
    }
    next(error)
  }
})

export { router as credentialRouter }
