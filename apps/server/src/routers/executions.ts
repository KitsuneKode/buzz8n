import { Router, type NextFunction, type Request, type Response } from 'express'
import { rateLimitMiddleware } from '@/middlewares/rate-limiter-middleware'
import { auth } from '@/middlewares/auth-middleware'
import { logger } from '@/utils/logger'
import { prisma } from '@buzz8n/store'

const router = Router()

router.use('/execution', auth)
router.get(
  '/execution/:executionId',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const executionId = req.params.executionId

      if (!executionId) {
        res.status(422).json({ error: 'Invalid Data' })
        return
      }

      const userId = req.user!.userId

      const execution = await prisma.execution.findFirst({
        where: {
          id: executionId,
          userId,
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              active: true,
            },
          },
        },
      })

      if (!execution) {
        res.status(404).json({ error: 'Execution not found' })
        return
      }

      // Parse logs from JSON strings to objects
      const parsedExecution = {
        ...execution,
        logs: execution.logs.map((log) => {
          try {
            return typeof log === 'string' ? JSON.parse(log) : log
          } catch (error) {
            logger.error('Failed to parse execution log', { error })
            return log
          }
        }),
      }

      res.status(200).json(parsedExecution)
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  '/execution',
  rateLimitMiddleware.list,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt((req.query.limit as string) || '20')
      const cursor = req.query.cursor as string

      const userId = req.user!.userId

      if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
        return res.status(400).json({ error: 'Invalid cursor format' })
      }
      const executions = await prisma.execution.findMany({
        where: {
          userId,
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              active: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      })
      // Determine if there are more pages and set cursor
      const hasNextPage = executions.length > limit
      const actualExecutions = hasNextPage ? executions.slice(0, limit) : executions
      const nextCursor = hasNextPage ? actualExecutions[actualExecutions.length - 1]?.id : undefined

      // Parse logs from JSON strings to objects for each execution
      const parsedExecutions = actualExecutions.map((execution) => ({
        ...execution,
        logs: execution.logs.map((log) => {
          try {
            return typeof log === 'string' ? JSON.parse(log) : log
          } catch (error) {
            logger.error('Failed to parse execution log', { error })
            return log
          }
        }),
      }))

      res.status(200).json({ executions: parsedExecutions, cursor: nextCursor })
    } catch (error) {
      next(error)
    }
  },
)

export { router as executionRouter }
