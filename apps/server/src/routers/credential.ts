import { Router, type NextFunction, type Request, type Response } from 'express'
import { prisma, PrismaClientKnownRequestError } from '@buzz8n/store'
import { credentialSchema } from '@buzz8n/common/types'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/credential', auth)

router.get('/credential', async (req, res, next: NextFunction) => {
  try {
    const userId = req.user!.userId

    const credentials = await prisma.credential.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        data: true,
        platform: true,
        title: true,
        createdAt: true,
      },
    })

    res.status(200).send({ credentials })
    return
  } catch (error) {
    next(error)
  }
})

router.post('/credential', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isParsed = credentialSchema.safeParse(req.body)
    console.log(req.body.data)

    if (!isParsed.success) {
      logger.error('not parsed')
      console.log(isParsed)

      res.status(422).send('Invalid Data')
      return
    }

    const { platform, data, title } = isParsed.data

    console.log(data)

    const credential = await prisma.credential.create({
      data: {
        data,
        title,
        platform,
        userId: req.user!.userId,
      },
    })

    if (!credential) {
      throw new Error('No credential were created')
    }

    res.status(201).json(credential)
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
