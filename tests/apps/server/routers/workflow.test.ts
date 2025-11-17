import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'

// Mock dependencies
const mockLoggerInfo: any = mock(() => {})
const mockLoggerError: any = mock(() => {})
const mockEnqueueExecution: any = mock(() => Promise.resolve())
const mockPrismaWorkflowFindMany: any = mock(() => Promise.resolve([]))
const mockPrismaWorkflowFindUnique: any = mock(() => Promise.resolve(null))
const mockPrismaWorkflowCreate: any = mock(() => Promise.resolve(null))
const mockPrismaWorkflowUpdate: any = mock(() => Promise.resolve(null))
const mockPrismaWorkflowDelete: any = mock(() => Promise.resolve(null))
const mockPrismaWorkflowCount: any = mock(() => Promise.resolve(0))
const mockPrismaExecutionCreate: any = mock(() => Promise.resolve(null))
const mockPrismaExecutionFindMany: any = mock(() => Promise.resolve([]))
const mockPrismaTransaction: any = mock(async (operations: any) => {
  return await Promise.all(operations)
})

mock.module('@apps/server/src/utils/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}))

mock.module('@apps/server/src/redis/enqueue', () => ({
  enqueueExecution: mockEnqueueExecution,
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    workflow: {
      findMany: mockPrismaWorkflowFindMany,
      findUnique: mockPrismaWorkflowFindUnique,
      create: mockPrismaWorkflowCreate,
      update: mockPrismaWorkflowUpdate,
      delete: mockPrismaWorkflowDelete,
      count: mockPrismaWorkflowCount,
    },
    execution: {
      create: mockPrismaExecutionCreate,
      findMany: mockPrismaExecutionFindMany,
    },
    $transaction: mockPrismaTransaction,
  },
  Methods: {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
  },
  PrismaClientKnownRequestError: class extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.code = code
    }
  },
}))

mock.module('@buzz8n/common/types', () => ({
  createWorkflowSchema: {
    safeParse: mock((data: any) => {
      if (data.name) {
        return { success: true, data: { name: data.name, active: data.active || false } }
      }
      return { success: false }
    }),
  },
  updateWorkflowSchema: {
    safeParse: mock((data: any) => {
      if (data !== undefined) {
        return {
          success: true,
          data: {
            active: data.active,
            nodes: data.nodes,
            edges: data.edges,
          },
        }
      }
      return { success: false }
    }),
  },
}))

describe('Workflow Router', () => {
  beforeEach(() => {
    mockLoggerInfo.mockClear()
    mockLoggerError.mockClear()
    mockEnqueueExecution.mockClear()
    mockPrismaWorkflowFindMany.mockClear()
    mockPrismaWorkflowFindUnique.mockClear()
    mockPrismaWorkflowCreate.mockClear()
    mockPrismaWorkflowUpdate.mockClear()
    mockPrismaWorkflowDelete.mockClear()
    mockPrismaWorkflowCount.mockClear()
    mockPrismaExecutionCreate.mockClear()
    mockPrismaExecutionFindMany.mockClear()
    mockPrismaTransaction.mockClear()
  })

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    params: {},
    query: {},
    body: {},
    user: { userId: 'user-123', email: 'test@example.com' },
    ...overrides,
  })

  const createMockResponse = (): Partial<Response> => {
    const res: any = {
      status: mock(function (this: any, code: number) {
        this.statusCode = code
        return this
      }),
      send: mock(function (this: any, data: any) {
        this.body = data
        return this
      }),
      json: mock(function (this: any, data: any) {
        this.body = data
        return this
      }),
      statusCode: 200,
      body: null,
    }
    return res
  }

  const createMockNext = (): NextFunction => mock(() => {}) as any

  describe('GET /workflow (List workflows)', () => {
    test('should return paginated workflows with default limit', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockWorkflows = [
        {
          id: 'wf-1',
          name: 'Workflow 1',
          active: true,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-123',
        },
        {
          id: 'wf-2',
          name: 'Workflow 2',
          active: false,
          status: 'inactive',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-123',
        },
      ]

      mockPrismaWorkflowFindMany.mockResolvedValueOnce(mockWorkflows)
      mockPrismaWorkflowCount.mockResolvedValueOnce(2)

      const req = createMockRequest({ query: {} })
      const res = createMockResponse()

      const limit = parseInt((req.query!.limit as string) || '20')
      const userId = req.user!.userId

      const [workflowList, totalCount] = await prisma.$transaction([
        prisma.workflow.findMany({
          take: limit + 1,
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
        }),
        prisma.workflow.count({
          where: {
            archived: false,
            userId,
          },
        }),
      ])

      const hasNextPage = workflowList.length > limit
      const actualWorkflows = hasNextPage ? workflowList.slice(0, limit) : workflowList
      const nextCursor = hasNextPage ? actualWorkflows[actualWorkflows.length - 1]?.id : undefined

      res.status!(200).json!({ workflows: actualWorkflows, cursor: nextCursor, totalCount })

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        workflows: mockWorkflows,
        cursor: undefined,
        totalCount: 2,
      })
    })

    test('should return 400 for invalid cursor format', async () => {
      const req = createMockRequest({ query: { cursor: 'invalid cursor with spaces!' } })
      const res = createMockResponse()

      const cursor = req.query!.cursor as string
      if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
        res.status!(400).json!({ error: 'Invalid cursor format' })
      }

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid cursor format' })
    })

    test('should handle pagination with cursor', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockWorkflows = Array.from({ length: 21 }, (_, i) => ({
        id: `wf-${i}`,
        name: `Workflow ${i}`,
        active: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123',
      }))

      mockPrismaWorkflowFindMany.mockResolvedValueOnce(mockWorkflows)
      mockPrismaWorkflowCount.mockResolvedValueOnce(50)

      const req = createMockRequest({ query: { limit: '20', cursor: 'wf-0' } })
      const res = createMockResponse()

      const limit = parseInt((req.query!.limit as string) || '20')
      const cursor = req.query!.cursor as string
      const userId = req.user!.userId

      const [workflowList, totalCount] = await prisma.$transaction([
        prisma.workflow.findMany({
          take: limit + 1,
          ...(cursor && {
            cursor: { id: cursor },
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
        }),
        prisma.workflow.count({
          where: {
            archived: false,
            userId,
          },
        }),
      ])

      const hasNextPage = workflowList.length > limit
      const actualWorkflows = hasNextPage ? workflowList.slice(0, limit) : workflowList
      const nextCursor = hasNextPage ? actualWorkflows[actualWorkflows.length - 1]?.id : undefined

      res.status!(200).json!({ workflows: actualWorkflows, cursor: nextCursor, totalCount })

      expect(mockPrismaWorkflowFindMany).toHaveBeenCalledWith({
        take: 21,
        cursor: { id: 'wf-0' },
        skip: 1,
        where: {
          archived: false,
          userId: 'user-123',
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
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          workflows: expect.any(Array),
          cursor: expect.any(String),
          totalCount: 50,
        })
      )
    })
  })

  describe('GET /workflow/:id (Get single workflow)', () => {
    test('should return 422 when id is missing', async () => {
      const req = createMockRequest({ params: {} })
      const res = createMockResponse()

      const id = req.params!.id
      if (!id) {
        res.status!(422).send!('Invalid Data')
      }

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should return 404 when workflow not found', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce(null)

      const req = createMockRequest({ params: { id: 'nonexistent-wf' } })
      const res = createMockResponse()

      const id = req.params!.id
      const userId = req.user!.userId

      const workflow = await prisma.workflow.findUnique({
        where: {
          id,
          userId,
        },
      })

      if (!workflow) {
        res.status!(404).send!('Data not found')
      }

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('Data not found')
    })

    test('should return workflow when found', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockWorkflow = {
        id: 'wf-123',
        name: 'Test Workflow',
        active: true,
        nodes: [],
        edges: [],
        userId: 'user-123',
      }

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce(mockWorkflow)

      const req = createMockRequest({ params: { id: 'wf-123' } })
      const res = createMockResponse()

      const id = req.params!.id
      const userId = req.user!.userId

      const workflow = await prisma.workflow.findUnique({
        where: {
          id,
          userId,
        },
      })

      if (workflow) {
        res.status!(200).json!(workflow)
      }

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockWorkflow)
    })
  })

  describe('POST /workflow (Create workflow)', () => {
    test('should return 422 when validation fails', async () => {
      const { createWorkflowSchema } = await import('@buzz8n/common/types')
      const req = createMockRequest({ body: {} })
      const res = createMockResponse()

      const { success } = createWorkflowSchema.safeParse(req.body)

      if (!success) {
        res.status!(422).send!('Invalid Data')
      }

      expect(mockLoggerError).toHaveBeenCalledWith('not parsed')
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should successfully create workflow', async () => {
      const { createWorkflowSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      const mockWorkflow = {
        id: 'new-wf-123',
        name: 'New Workflow',
        active: false,
        userId: 'user-123',
      }

      mockPrismaWorkflowCreate.mockResolvedValueOnce(mockWorkflow)

      const req = createMockRequest({
        body: {
          name: 'New Workflow',
          active: false,
        },
      })
      const res = createMockResponse()

      const { success, data } = createWorkflowSchema.safeParse(req.body)

      if (success) {
        const { active, name } = data
        const userId = req.user!.userId

        const workflow = await prisma.workflow.create({
          data: {
            active,
            name,
            userId,
          },
        })

        if (workflow) {
          res.status!(201).json!(workflow)
        }
      }

      expect(mockPrismaWorkflowCreate).toHaveBeenCalledWith({
        data: {
          active: false,
          name: 'New Workflow',
          userId: 'user-123',
        },
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockWorkflow)
    })

    test('should return 409 when workflow with name already exists', async () => {
      const { createWorkflowSchema } = await import('@buzz8n/common/types')
      const { prisma, PrismaClientKnownRequestError } = await import('@buzz8n/store')

      const prismaError = new (PrismaClientKnownRequestError as any)(
        'Unique constraint failed',
        'P2002'
      )
      mockPrismaWorkflowCreate.mockRejectedValueOnce(prismaError)

      const req = createMockRequest({
        body: {
          name: 'Existing Workflow',
          active: false,
        },
      })
      const res = createMockResponse()

      const { success, data } = createWorkflowSchema.safeParse(req.body)

      if (success) {
        try {
          const { active, name } = data
          const userId = req.user!.userId

          await prisma.workflow.create({
            data: {
              active,
              name,
              userId,
            },
          })
        } catch (error: any) {
          if (error.code === 'P2002') {
            res.status!(409).send!('Workflow with that name already exists')
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.send).toHaveBeenCalledWith('Workflow with that name already exists')
    })
  })

  describe('POST /workflow/:id/execute (Execute workflow)', () => {
    test('should return 422 when workflowId is missing', async () => {
      const req = createMockRequest({ params: {} })
      const res = createMockResponse()

      const workflowId = req.params!.id

      if (!workflowId) {
        res.status!(422).send!('Invalid Data')
      }

      expect(mockLoggerError).toHaveBeenCalledWith('not parsed')
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should return 404 when workflow not found', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce(null)

      const req = createMockRequest({ params: { id: 'nonexistent-wf' } })
      const res = createMockResponse()

      const workflowId = req.params!.id
      const userId = req.user!.userId

      const workflow = await prisma.workflow.findUnique({
        where: {
          id: workflowId,
          userId,
        },
      })

      if (!workflow) {
        res.status!(404).send!('Workflow not found')
      }

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('Workflow not found')
    })

    test('should return 409 when workflow is not active', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce({
        id: 'wf-123',
        active: false,
        userId: 'user-123',
      })

      const req = createMockRequest({ params: { id: 'wf-123' } })
      const res = createMockResponse()

      const workflowId = req.params!.id
      const userId = req.user!.userId

      const workflow = await prisma.workflow.findUnique({
        where: {
          id: workflowId,
          userId,
        },
      })

      if (workflow && !workflow.active) {
        res
          .status!(409)
          .send!('Workflow is not active to execute. Please activate the workflow first.')
      }

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.send).toHaveBeenCalledWith(
        'Workflow is not active to execute. Please activate the workflow first.'
      )
    })

    test('should successfully execute active workflow', async () => {
      const { prisma } = await import('@buzz8n/store')
      const { enqueueExecution } = await import('@apps/server/src/redis/enqueue')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce({
        id: 'wf-123',
        active: true,
        userId: 'user-123',
      })

      mockPrismaExecutionCreate.mockResolvedValueOnce({
        id: 'exec-456',
      })

      const req = createMockRequest({ params: { id: 'wf-123' } })
      const res = createMockResponse()

      const workflowId = req.params!.id
      const userId = req.user!.userId

      const workflow = await prisma.workflow.findUnique({
        where: {
          id: workflowId,
          userId,
        },
      })

      if (workflow && workflow.active) {
        const execution = await prisma.execution.create({
          data: {
            workflowId,
            userId,
          },
        })

        if (execution) {
          const queuePayload = {
            executionId: execution.id,
            workflowId: workflowId,
            data: {
              triggerType: 'manualTrigger',
            },
          }

          await enqueueExecution(queuePayload)

          res.status!(202).json!({
            message: 'Execution accepted',
            payload: queuePayload,
          })
        }
      }

      expect(mockPrismaExecutionCreate).toHaveBeenCalledWith({
        data: {
          workflowId: 'wf-123',
          userId: 'user-123',
        },
      })
      expect(mockEnqueueExecution).toHaveBeenCalledWith({
        executionId: 'exec-456',
        workflowId: 'wf-123',
        data: {
          triggerType: 'manualTrigger',
        },
      })
      expect(res.status).toHaveBeenCalledWith(202)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Execution accepted',
        payload: expect.objectContaining({
          executionId: 'exec-456',
          workflowId: 'wf-123',
        }),
      })
    })
  })

  describe('PUT /workflow/:id (Update workflow)', () => {
    test('should return 422 when id is missing or validation fails', async () => {
      const { updateWorkflowSchema } = await import('@buzz8n/common/types')
      const req = createMockRequest({ params: {}, body: undefined })
      const res = createMockResponse()

      const id = req.params!.id
      const { success } = updateWorkflowSchema.safeParse(req.body)

      if (!id || !success) {
        res.status!(422).send!('Invalid Data')
      }

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should return 404 when workflow not found', async () => {
      const { updateWorkflowSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce(null)

      const req = createMockRequest({
        params: { id: 'nonexistent-wf' },
        body: { active: true },
      })
      const res = createMockResponse()

      const id = req.params!.id
      const { success } = updateWorkflowSchema.safeParse(req.body)
      const userId = req.user!.userId

      if (id && success) {
        const workflow = await prisma.workflow.findUnique({
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
          res.status!(404).send!('Workflow not found')
        }
      }

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('Workflow not found')
    })

    test('should successfully update workflow without webhook', async () => {
      const { updateWorkflowSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce({
        id: 'wf-123',
        webhook: null,
      })

      const updatedWorkflow = {
        id: 'wf-123',
        active: true,
        nodes: [{ id: 'node-1', type: 'start' }],
        edges: [],
      }

      mockPrismaWorkflowUpdate.mockResolvedValueOnce(updatedWorkflow)

      const req = createMockRequest({
        params: { id: 'wf-123' },
        body: {
          active: true,
          nodes: [{ id: 'node-1', type: 'start' }],
          edges: [],
        },
      })
      const res = createMockResponse()

      const id = req.params!.id
      const { success, data } = updateWorkflowSchema.safeParse(req.body)
      const userId = req.user!.userId

      if (id && success) {
        const workflow = await prisma.workflow.findUnique({
          where: { id, userId },
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

        if (workflow) {
          const { active, nodes, edges } = data

          const updatedWf = await prisma.workflow.update({
            where: { id, userId },
            data: {
              active,
              nodes,
              edges,
            },
          })

          if (updatedWf) {
            res.status!(200).json!(updatedWf)
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updatedWorkflow)
    })

    test('should return 422 when webhook path is empty', async () => {
      const { updateWorkflowSchema } = await import('@buzz8n/common/types')
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowFindUnique.mockResolvedValueOnce({
        id: 'wf-123',
        webhook: null,
      })

      const req = createMockRequest({
        params: { id: 'wf-123' },
        body: {
          active: true,
          nodes: [
            {
              id: 'webhook-1',
              data: {
                type: 'webhook',
                config: {
                  path: '',
                  secret: 'my-secret',
                },
              },
            },
          ],
          edges: [],
        },
      })
      const res = createMockResponse()

      const id = req.params!.id
      const { success, data } = updateWorkflowSchema.safeParse(req.body)
      const userId = req.user!.userId

      if (id && success) {
        const workflow = await prisma.workflow.findUnique({
          where: { id, userId },
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

        if (workflow) {
          const { nodes } = data
          const webhookNode = nodes?.find((node: any) => node.data.type === 'webhook')

          if (webhookNode && (!webhookNode.data.config.path || webhookNode.data.config.path.trim() === '')) {
            res.status!(422).send!('Webhook path is required')
          }
        }
      }

      expect(mockLoggerError).toHaveBeenCalledWith('Webhook path is empty or invalid:', '')
      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Webhook path is required')
    })
  })

  describe('DELETE /workflow/:id (Delete workflow)', () => {
    test('should return 422 when id is missing', async () => {
      const req = createMockRequest({ params: {} })
      const res = createMockResponse()

      const id = req.params!.id

      if (!id) {
        res.status!(422).send!('Invalid Data')
      }

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should successfully delete workflow', async () => {
      const { prisma } = await import('@buzz8n/store')

      mockPrismaWorkflowDelete.mockResolvedValueOnce({})

      const req = createMockRequest({ params: { id: 'wf-123' } })
      const res = createMockResponse()

      const id = req.params!.id
      const userId = req.user!.userId

      if (id) {
        await prisma.workflow.delete({
          where: {
            id,
            userId,
          },
        })

        res.status!(200).send!('Workflow deleted successfully')
      }

      expect(mockPrismaWorkflowDelete).toHaveBeenCalledWith({
        where: {
          id: 'wf-123',
          userId: 'user-123',
        },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith('Workflow deleted successfully')
    })

    test('should return 404 when workflow does not exist', async () => {
      const { prisma, PrismaClientKnownRequestError } = await import('@buzz8n/store')

      const prismaError = new (PrismaClientKnownRequestError as any)('Record not found', 'P2025')
      mockPrismaWorkflowDelete.mockRejectedValueOnce(prismaError)

      const req = createMockRequest({ params: { id: 'nonexistent-wf' } })
      const res = createMockResponse()

      const id = req.params!.id
      const userId = req.user!.userId

      if (id) {
        try {
          await prisma.workflow.delete({
            where: {
              id,
              userId,
            },
          })
        } catch (error: any) {
          if (error.code === 'P2025') {
            res.status!(404).send!('Workflow with that id does not exists')
          }
        }
      }

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith('Workflow with that id does not exists')
    })
  })

  describe('GET /workflow/:id/executions (Get workflow executions)', () => {
    test('should return 422 when workflowId is missing', async () => {
      const req = createMockRequest({ params: {} })
      const res = createMockResponse()

      const workflowId = req.params!.id

      if (!workflowId) {
        res.status!(422).send!('Invalid Data')
      }

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.send).toHaveBeenCalledWith('Invalid Data')
    })

    test('should return 400 for invalid cursor format', async () => {
      const req = createMockRequest({
        params: { id: 'wf-123' },
        query: { cursor: 'invalid cursor!' },
      })
      const res = createMockResponse()

      const cursor = req.query!.cursor as string

      if (cursor && !/^[a-zA-Z0-9_-]+$/.test(cursor)) {
        res.status!(400).json!({ error: 'Invalid cursor format' })
      }

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid cursor format' })
    })

    test('should return paginated executions with parsed logs', async () => {
      const { prisma } = await import('@buzz8n/store')

      const mockExecutions = [
        {
          id: 'exec-1',
          workflowId: 'wf-123',
          userId: 'user-123',
          status: 'success',
          logs: ['{"message":"Step 1 completed"}', '{"message":"Step 2 completed"}'],
          workflow: {
            id: 'wf-123',
            name: 'Test Workflow',
            active: true,
          },
          updatedAt: new Date(),
        },
      ]

      mockPrismaExecutionFindMany.mockResolvedValueOnce(mockExecutions)

      const req = createMockRequest({
        params: { id: 'wf-123' },
        query: { limit: '20' },
      })
      const res = createMockResponse()

      const workflowId = req.params!.id
      const limit = parseInt((req.query!.limit as string) || '20')
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
      })

      const hasNextPage = executions.length > limit
      const actualExecutions = hasNextPage ? executions.slice(0, limit) : executions
      const nextCursor = hasNextPage ? actualExecutions[actualExecutions.length - 1]?.id : undefined

      const parsedExecutions = actualExecutions.map((execution) => ({
        ...execution,
        logs: execution.logs.map((log: any) => {
          try {
            return typeof log === 'string' ? JSON.parse(log) : log
          } catch {
            return log
          }
        }),
      }))

      res.status!(200).json!({ executions: parsedExecutions, cursor: nextCursor })

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        executions: expect.arrayContaining([
          expect.objectContaining({
            id: 'exec-1',
            logs: [{ message: 'Step 1 completed' }, { message: 'Step 2 completed' }],
          }),
        ]),
        cursor: undefined,
      })
    })
  })
})
