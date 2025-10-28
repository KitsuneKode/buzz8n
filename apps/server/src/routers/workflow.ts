import { createWorkflowSchema, updateWorkflowSchema } from '@buzz8n/common/types'
import { Router, type NextFunction, type Request, type Response } from 'express'
import { Methods, PrismaClientKnownRequestError, prisma } from '@buzz8n/store'
import { rateLimitMiddleware } from '@/middlewares/rate-limiter-middleware'
import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { auth } from '@/middlewares/auth-middleware'
import { enqueueExecution } from '@/redis/enqueue'
import { logger } from '@/utils/logger'

const router = Router()

router.use('/workflow', auth)

router.get(
  '/workflow',
  rateLimitMiddleware.list,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt((req.query.limit as string) || '20')
      const cursor = req.query.cursor as string | undefined

      if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
        return res.status(400).json({ error: 'Invalid cursor format' })
      }

      const userId = req.user!.userId

      const whereClause = {
        archived: false,
        userId,
      }

      const [workflowList, totalCount] = await prisma.$transaction([
        prisma.workflow.findMany({
          take: limit + 1,
          ...(cursor && {
            cursor: { id: cursor as string },
            skip: 1,
          }),
          where: whereClause,
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
        }),
        prisma.workflow.count({
          where: whereClause,
        }),
      ])

      // Determine if there are more pages and set cursor
      const hasNextPage = workflowList.length > limit
      const actualWorkflows = hasNextPage ? workflowList.slice(0, limit) : workflowList
      const nextCursor = hasNextPage ? actualWorkflows[actualWorkflows.length - 1]?.id : undefined

      res.status(200).json({ workflows: actualWorkflows, cursor: nextCursor, totalCount })
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  '/workflow/:id',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
)

router.post(
  '/workflow',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
)

router.post(
  '/workflow/:id/execute',
  rateLimitMiddleware.execution,
  async (req: Request, res: Response, next: NextFunction) => {
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
        res
          .status(409)
          .send('Workflow is not active to execute. Please activate the workflow first.')
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
  },
)

router.put(
  '/workflow/:id',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
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

      // console.log(data?.active)
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

      // console.log('=== WEBHOOK DEBUG ===')
      // console.log('existingWebhookPath:', existingWebhookPath)
      // console.log('existingWebhookSecret:', existingWebhookSecret)
      // console.log('nodes:', JSON.stringify(nodes, null, 2))

      let newWebhook = null
      let deletedWebhook = false
      if (nodes && nodes.length > 0) {
        // Find webhook node in the workflow
        const webhookNode = nodes.find((node) => node.data.type === 'webhook')

        if (webhookNode) {
          // console.log('webhookNode.data.config:', webhookNode.data.config)
          // console.log('webhookNode.data.config.path:', webhookNode.data.config.path)
          // console.log('webhookNode.data.config.secret:', webhookNode.data.config.secret)

          // Check if this is a new webhook (different from existing or no existing webhook)
          const isNewWebhook =
            !existingWebhookPath ||
            webhookNode.data.config.path !== existingWebhookPath ||
            webhookNode.data.config.secret !== existingWebhookSecret

          // console.log('isNewWebhook:', isNewWebhook)
          // console.log('!existingWebhookPath:', !existingWebhookPath)
          // console.log('path different:', webhookNode.data.config.path !== existingWebhookPath)
          // console.log('secret different:', webhookNode.data.config.secret !== existingWebhookSecret)

          if (isNewWebhook) {
            newWebhook = webhookNode
          }
        }

        // Check if webhook was deleted (had existing webhook but no webhook node in new workflow)
        deletedWebhook = !!(existingWebhookPath && !webhookNode)
      } else {
        deletedWebhook = active === undefined ? !!existingWebhookPath : false
      }

      // console.log('newWebhook:', newWebhook)
      // console.log('deletedWebhook:', deletedWebhook)
      // console.log('=== END WEBHOOK DEBUG ===')
      // // return res.status(404).send('not found')

      if (newWebhook) {
        logger.info('Creating/updating webhook...')
        const webhookData = {
          method: Methods.POST,
          path: newWebhook.data.config.path as string,
          secret: newWebhook.data.config.secret as string | undefined,
        }

        // console.log('webhookData:', webhookData)

        // Validate webhook data
        if (!webhookData.path || webhookData.path.trim() === '') {
          logger.error('Webhook path is empty or invalid:', webhookData.path)
          res.status(422).send('Webhook path is required')
          return
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

          // include: {
          //   webhook: {
          //     select: {
          //       id: true,
          //       method: true,
          //       path: true,
          //       secret: true,
          //     },
          //   },
          // },
        })
        // console.log('Webhook created/updated successfully:', workflow?.webhook)
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
  },
)

router.delete(
  '/workflow/:id',
  rateLimitMiddleware.api,
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
)

router.get(
  '/workflow/:id/executions',
  rateLimitMiddleware.list,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflowId = req.params.id
      const limit = parseInt((req.query.limit as string) || '20')
      const cursor = req.query.cursor as string

      if (!workflowId) {
        res.status(422).send('Invalid Data')
        return
      }

      if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
        return res.status(400).json({ error: 'Invalid cursor format' })
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
        logs: execution.logs.map((log) => {
          try {
            return typeof log === 'string' ? JSON.parse(log) : log
          } catch (error) {
            logger.error('Failed to parse execution log', { executionId: execution.id, error })
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

export { router as workflowRouter }
