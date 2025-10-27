import { supportedMethodsSchema, type SupportedMethods } from '@buzz8n/common/types'
import { Router, type Request, type Response, type NextFunction } from 'express'
import { rateLimitMiddleware } from '@/middlewares/rate-limiter-middleware'
import { enqueueExecution } from '@/redis/enqueue'
import { logger } from '@/utils/logger'
import { prisma } from '@buzz8n/store'

const router = Router()

// Apply rate limiting to webhook endpoints
router.use('/webhook', rateLimitMiddleware.webhook)

router.all('/webhook/:webhookPath', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookPath = req.params.webhookPath
    const authorization = req.headers.authorization
    const secret_token = authorization?.trim().split(/\s+/).at(1)

    const { success, data: method } = supportedMethodsSchema.safeParse(req.method)

    if (!webhookPath || !success) {
      logger.error('not parsed')
      res.status(422).send('Invalid Data')
      return
    }

    const webhook = await prisma.webhook.findUnique({
      where: {
        method,
        path: webhookPath,
      },
      select: {
        workflowId: true,
        workflow: {
          select: {
            userId: true,
            active: true,
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
      res.status(403).send('Webhook called with invalid secret. Not authorized')
      return
    }

    if (!webhook.workflow.active) {
      res.status(409).send('Workflow is not active to execute. Please activate the workflow first.')
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

    res.status(202).json({
      message: 'Execution accepted',
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
