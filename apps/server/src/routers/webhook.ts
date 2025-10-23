import { supportedMethodsSchema, type SupportedMethods } from '@buzz8n/common/types'
import { Router, type Request, type Response, type NextFunction } from 'express'
import { enqueueExecution } from '@/redis/enqueue'
import { logger } from '@/utils/logger'
import { prisma } from '@buzz8n/store'

const router = Router()

//TODO:RateLimited
// router.use('/webhook', rateLimitMiddleware)

router.all('/webhook/:webhookId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookId = req.params.webhookId
    const authorization = req.headers.authorization
    const secret_token = authorization?.trim().split(/\s+/).at(1)

    const { success, data: method } = supportedMethodsSchema.safeParse(req.method)

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
      data: {
        triggerType: 'webhook',
      },
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

export { router as webhookRouter }
