import { Router, type NextFunction, type Request, type Response } from 'express'
import { auth } from '@/middlewares/auth-middleware'
import { prisma } from '@buzz8n/store'

const router = Router()

router.use('/execution', auth)
router.get('/execution/:executionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const executionId = req.params.executionId

    if (!executionId) {
      res.status(422).send('Invalid Data')
      return
    }

    const userId = req.user!.userId

    const execution = await prisma.execution.findUnique({
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
      res.status(404).send('Execution not found')
      return
    }

    // Parse logs from JSON strings to objects
    const parsedExecution = {
      ...execution,
      logs: execution.logs.map((log: any) => {
        try {
          return typeof log === 'string' ? JSON.parse(log) : log
        } catch (error) {
          console.error('Failed to parse log:', log, error)
          return log
        }
      }),
    }

    console.log('execution', parsedExecution)
    res.status(200).json(parsedExecution)
  } catch (error) {
    next(error)
  }
})

router.get('/execution', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt((req.query.limit as string) || '20')
    const cursor = req.query.cursor as string

    const userId = req.user!.userId

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
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    })
    // Parse logs from JSON strings to objects for each execution
    const parsedExecutions = executions.map((execution) => ({
      ...execution,
      logs: execution.logs.map((log: any) => {
        try {
          return typeof log === 'string' ? JSON.parse(log) : log
        } catch (error) {
          console.error('Failed to parse log:', log, error)
          return log
        }
      }),
    }))

    const nextCursor =
      executions.length === limit ? executions[executions.length - 1]?.id : undefined

    res.status(200).json({ executions: parsedExecutions, cursor: nextCursor })
  } catch (error) {
    next(error)
  }
})

export { router as executionRouter }
