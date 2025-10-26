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
    const limit = parseInt((req.query.limit as string) || '20')
    const cursor = req.query.cursor as string

    const credentials = await prisma.credential.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      where: {
        userId,
        archived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        data: true,
        platform: true,
        title: true,
        createdAt: true,
      },
    })

    // Determine if there are more pages and set cursor
    const hasNextPage = credentials.length > limit
    const actualCredentials = hasNextPage ? credentials.slice(0, limit) : credentials
    const nextCursor = hasNextPage ? actualCredentials[actualCredentials.length - 1]?.id : undefined

    res.status(200).send({
      credentials: actualCredentials,
      cursor: nextCursor,
    })
    return
  } catch (error) {
    next(error)
  }
})

router.post('/credential', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isParsed = credentialSchema.safeParse(req.body)

    if (!isParsed.success) {
      logger.error('not parsed', { body: req.body })

      res.status(422).send('Invalid Data')
      return
    }

    const { platform, data, title } = isParsed.data

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

router.delete('/credential', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credentialId = req.body.id as string

    if (!credentialId) {
      logger.error('no Id', { body: req.body })

      res.status(422).send('Invalid Data')
      return
    }

    const credential = await prisma.credential.update({
      where: {
        id: credentialId,
        userId: req.user!.userId,
      },
      data: {
        archived: true,
      },
    })

    if (!credential) {
      throw new Error('No credential were created')
    }

    res.status(200).json(credential)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).send('Credential with that id does not exists')
        return
      }
    }
    next(error)
  }
})

export { router as credentialRouter }
