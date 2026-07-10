import { Router, type NextFunction, type Request, type Response } from 'express'
import { rateLimitMiddleware } from '@/middlewares/rate-limiter-middleware'
import { encryptCredentialData } from '@buzz8n/backend-common/crypto'
import { prisma, PrismaClientKnownRequestError } from '@buzz8n/store'
import { credentialSchema } from '@buzz8n/common/types'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/credential', auth)

router.get('/credential', rateLimitMiddleware.list, async (req, res, next: NextFunction) => {
  try {
    const userId = req.user!.userId
    const limit = parseInt((req.query.limit as string) || '20')
    const cursor = req.query.cursor as string

    if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
      return res.status(400).json({ error: 'Invalid cursor format' })
    }
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
        platform: true,
        title: true,
        createdAt: true,
      },
    })

    // Determine if there are more pages and set cursor
    const hasNextPage = credentials.length > limit
    const actualCredentials = hasNextPage ? credentials.slice(0, limit) : credentials
    const nextCursor = hasNextPage ? actualCredentials[actualCredentials.length - 1]?.id : undefined

    res.status(200).json({
      credentials: actualCredentials,
      cursor: nextCursor,
    })
    return
  } catch (error) {
    next(error)
  }
})

router.post(
  '/credential',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isParsed = credentialSchema.safeParse(req.body)

      if (!isParsed.success) {
        logger.error('not parsed', { body: req.body })

        res.status(422).json({ error: 'Invalid Data' })
        return
      }

      const { platform, data, title } = isParsed.data
      const envelope = await encryptCredentialData(data as Record<string, unknown>)

      const credential = await prisma.credential.create({
        data: {
          data: envelope,
          title,
          platform,
          userId: req.user!.userId,
        },
        select: {
          id: true,
          title: true,
          platform: true,
          createdAt: true,
        },
      })

      if (!credential) {
        throw new Error('No credential were created')
      }

      res.status(201).json(credential)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          res.status(409).json({ error: 'Credential with that title already exists' })
          return
        }
      }

      next(error)
    }
  },
)

router.delete(
  '/credential',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const credentialId = req.body.id as string

      if (!credentialId) {
        logger.error('no Id', { body: req.body })

        res.status(422).json({ error: 'Invalid Data' })
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
        select: {
          id: true,
          title: true,
          platform: true,
          createdAt: true,
        },
      })

      if (!credential) {
        throw new Error('No credential were created')
      }

      res.status(200).json(credential)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          res.status(404).json({ error: 'Credential with that id does not exist' })
          return
        }
      }
      next(error)
    }
  },
)

export { router as credentialRouter }
