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
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor as string },
        skip: 1,
      }),
      where: {
        archived: false,
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        active: true,
        name: true,
        status: true,
        updatedAt: true,
        userId: true,
      },
    })

    // Determine if there are more pages and set cursor
    const hasNextPage = workflowList.length > limit
    const actualWorkflows = hasNextPage ? workflowList.slice(0, limit) : workflowList
    const nextCursor = hasNextPage ? actualWorkflows[actualWorkflows.length - 1]?.id : undefined

    res.status(200).json({ workflows: actualWorkflows, cursor: nextCursor })
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
      res.status(404).send('Data not found')
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

    if (!workflow.active) {
      res.status(409).send('Workflow is not active to execute. Please activate the workflow first.')
      return
    }

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
      data: {
        triggerType: 'manualTrigger',
      },
    }

    await enqueueExecution(queuePayload)

    res.status(202).json({
      message: 'Execution accepted',
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
            secret: true,
          },
        },
      },
    })

    if (!workflow) {
      res.status(404).send('Workflow not found')
      return
    }

    const existingWebhookPath = workflow.webhook?.path
    const existingWebhookSecret = workflow.webhook?.secret

    let newWebhook = null
    let deletedWebhook = false
    if (nodes && nodes.length > 0) {
      newWebhook = nodes.find(
        (node) =>
          node.data.type === 'webhook' &&
          !(node.data.config.path === existingWebhookPath && existingWebhookPath) &&
          !(node.data.config.secret === existingWebhookSecret),
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
        secret: newWebhook.data.config.secret as string | undefined,
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
                secret: webhookData.secret,
              },
              create: {
                method: webhookData.method,
                path: webhookData.path,
                secret: webhookData.secret,
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

router.get('/workflow/:id/executions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflowId = req.params.id
    const limit = parseInt((req.query.limit as string) || '20')
    const cursor = req.query.cursor as string

    if (!workflowId) {
      res.status(422).send('Invalid Data')
      return
    }

    const userId = req.user!.userId

    const executions = await prisma.execution.findMany({
      where: {
        workflowId,
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
      logs: execution.logs.map((log: any) => {
        try {
          return typeof log === 'string' ? JSON.parse(log) : log
        } catch (error) {
          console.error('Failed to parse log:', log, error)
          return log
        }
      }),
    }))

    res.status(200).json({ executions: parsedExecutions, cursor: nextCursor })
  } catch (error) {
    next(error)
  }
})

export { router as workflowRouter }
