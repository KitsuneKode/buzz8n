import { Router, type Request, type Response, type NextFunction } from 'express'
import { Methods, prisma, PrismaClientKnownRequestError } from '@buzz8n/store'
import { auth } from '@/middlewares/auth-middleware'
import { enqueueExecution } from '@/redis/enqueue'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/webhook', auth)

router.all('/webhook/:webhookId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookId = req.params.webhookId
    const authorization = req.headers.authorization
    const secret_token = authorization?.trim().split(/\s+/).at(1)

    //TODO:Add types/schema for methods

    const { success, data: method } = methodsSchema.safeParse(req.method)

    if (!webhookId || !success) {
      logger.error('not parsed')
      res.status(422).send('Invalid Data')
      return
    }

    const webhook = await prisma.webhook.findUnique({
      where: {
        method,
        path: webhookId,
      },
      select: {
        workflowId: true,
        workflow: {
          select: {
            userId: true,
          },
        },
        secret: true,
      },
    })

    if (!webhook) {
      logger.error('webhook not found')

      res.status(404).send('Invalid Request')
      return
    }

    if (webhook.secret && webhook.secret !== secret_token) {
      res.status(403).send('Not authorized')
      return
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId: webhook.workflowId,
        userId: webhook.workflow.userId,
      },
    })
    if (!execution) {
      throw new Error('Error creating execution')
    }
    await enqueueExecution({
      executionId: execution.id,
      workflowId: webhook.workflowId,
      payload: {},
    })

    res.status(200).json({
      message: 'Execution started',
      executionId: execution.id,
    })
  } catch (error) {
    // if (error instanceof PrismaClientKnownRequestError) {
    //   if (error.code === 'P2025') {
    //     res.status(404).send('Webhook with that id does not exists')
    //     return
    //   }
    // }
    next(error)
  }
})
