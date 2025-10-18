import { createWorkflowSchema, updateWorkflowSchema, workflowSchema } from '@buzz8n/common/types'
import { Router, type Request, type Response, type NextFunction } from 'express'
import { Methods, PrismaClientKnownRequestError, prisma } from '@buzz8n/store'
import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { auth } from '@/middlewares/auth-middleware'
import { enqueueExecution } from '@/redis/enqueue'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/workflow', auth)

router.get('/workflow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt((req.query.limit as string) || '20')
    const cursor = req.query.cursor

    const userId = req.user!.userId

    const workflowList = await prisma.workflow.findMany({
      take: limit,
      where: {
        archived: false,
        userId,
      },
      select: {
        id: true,
        createdAt: true,
        active: true,
        name: true,
        updatedAt: true,
        userId: true,
      },
    })

    res.status(200).json({ workflows: workflowList })
  } catch (error) {
    next(error)
  }
})

router.get('/workflow/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id

    if (!id) {
      res.status(422).send('Invalid Data')
      return
    }

    const userId = req.user!.userId

    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!workflow) {
      res.status(404).send('Page not found')
      return
    }

    res.status(200).json(workflow)
  } catch (error) {
    next(error)
  }
})

router.post('/workflow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { success, data } = createWorkflowSchema.safeParse(req.body)

    if (!success) {
      logger.error('not parsed')
      res.status(422).send('Invalid Data')
      return
    }

    const { active, name } = data
    const userId = req.user!.userId

    const workflow = await prisma.workflow.create({
      data: {
        active,
        name,
        userId,
      },
    })

    if (!workflow) {
      throw new Error('No workflow is created')
    }

    res.status(201).json(workflow)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).send('Workflow with that name already exists')
        return
      }
    }

    next(error)
  }
})

router.post('/workflow/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflowId = req.params.id

    if (!workflowId) {
      logger.error('not parsed')
      res.status(422).send('Invalid Data')
      return
    }

    const userId = req.user!.userId

    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflowId,
        userId,
      },
    })

    if (!workflow) {
      res.status(404).send('Workflow not found')
      return
    }

    // if(workflow.active){
    //   throw new Error('Workflow already executing', {cause: 'rate-limit'})
    // }

    const execution = await prisma.execution.create({
      data: {
        workflowId,
        userId,
      },
    })

    if (!execution) {
      throw new Error('Failed to create workflow')
    }

    const queuePayload: EnqueueExecutionPayload = {
      executionId: execution.id,
      workflowId: workflowId,
      payload: {},
    }

    await enqueueExecution(queuePayload)

    res.status(200).json({
      message: 'Execution started',
      payload: queuePayload,
    })
  } catch (error: unknown) {
    // if (error instanceof Error && error.cause === 'rate-limit') {
    //   res.status(409).send('Execution with id already exists')
    //   return
    // }
    next(error)
  }
})

router.put('/workflow/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    // const nodesdata = req.body.nodes
    // console.log(nodesdata)
    const { success, data } = updateWorkflowSchema.safeParse(req.body)
    const userId = req.user!.userId
    if (!id || !success) {
      res.status(422).send('Invalid Data')
      return
    }

    const { active, nodes, edges } = data

    let workflow = null

    workflow = await prisma.workflow.findUnique({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        webhook: {
          select: {
            id: true,
            path: true,
            method: true,
          },
        },
      },
    })

    if (!workflow) {
      res.status(404).send('Workflow not found')
      return
    }

    const existingWebhookPath = workflow.webhook?.path
    let newWebhook = null
    let deletedWebhook = false
    if (nodes && nodes.length > 0) {
      newWebhook = nodes.find(
        (node) =>
          node.data.type === 'webhook' &&
          !(node.data.config.path === existingWebhookPath && existingWebhookPath),
      )

      deletedWebhook = !!(
        !newWebhook &&
        existingWebhookPath &&
        !nodes.some((node) => node.data.type === 'webhook')
      )
    } else {
      deletedWebhook = !!existingWebhookPath
    }

    // console.log(existingWebhookPath)
    // console.log(newWebhook)
    // console.log(deletedWebhook)
    // // return res.status(404).send('not found')

    if (newWebhook) {
      const webhookData = {
        method: Methods.POST,
        path: newWebhook.data.config.path as string,
      }

      workflow = await prisma.workflow.update({
        where: {
          id,
          userId,
        },
        data: {
          active,
          nodes,
          edges,
          webhook: {
            upsert: {
              update: {
                method: webhookData.method,
                path: webhookData.path,
              },
              create: {
                method: webhookData.method,
                path: webhookData.path,
              },
            },
          },
        },
      })
    } else {
      if (deletedWebhook) {
        workflow = await prisma.workflow.update({
          where: {
            id,
            userId,
          },
          data: {
            active,
            nodes,
            edges,
            webhook: {
              delete: true,
            },
          },
        })
      } else {
        workflow = await prisma.workflow.update({
          where: {
            id,
            userId,
          },
          data: {
            active,
            nodes,
            edges,
          },
        })
      }
    }
    if (!workflow) {
      res.status(404).send('Workflow not found')
      return
    }

    res.status(200).json(workflow)
  } catch (error) {
    next(error)
  }
})

router.delete('/workflow/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const userId = req.user!.userId
    if (!id) {
      res.status(422).send('Invalid Data')
      return
    }

    await prisma.workflow.delete({
      where: {
        id,
        userId,
      },
    })

    res.status(200).send('Workflow deleted successfully')
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).send('Workflow with that id does not exists')
        return
      }
    }
    next(error)
  }
})

export { router as workflowRouter }
