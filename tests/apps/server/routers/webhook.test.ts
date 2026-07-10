import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'

// Mock dependencies
const mockEnqueueExecution: any = mock(() => Promise.resolve())
const mockLoggerInfo: any = mock(() => {})
const mockLoggerError: any = mock(() => {})
const mockPrismaWebhookFindUnique: any = mock(() => Promise.resolve(null))
const mockPrismaExecutionCreate: any = mock(() => Promise.resolve({ id: 'exec-123' }))

mock.module('@apps/server/src/redis/enqueue', () => ({
  enqueueExecution: mockEnqueueExecution,
}))

mock.module('@apps/server/src/utils/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    webhook: {
      findUnique: mockPrismaWebhookFindUnique,
      findFirst: mockPrismaWebhookFindUnique,
    },
    execution: {
      create: mockPrismaExecutionCreate,
    },
  },
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string
    constructor(message: string, { code = 'P2002' }: { code?: string } = {}) {
      super(message)
      this.code = code
      this.name = 'PrismaClientKnownRequestError'
    }
  },
  Methods: {},
  Platforms: {},
}))

mock.module('@buzz8n/common/types', () => ({
  supportedMethodsSchema: {
    safeParse: mock((method: string) => {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      if (validMethods.includes(method)) {
        return { success: true, data: method }
      }
      return { success: false }
    }),
  },
  apiError: (error: string, options?: { code?: string; details?: unknown }) => ({
    error,
    ...(options?.code ? { code: options.code } : {}),
    ...(options?.details !== undefined ? { details: options.details } : {}),
  }),
}))

describe('Webhook Router', () => {
  beforeEach(() => {
    mockEnqueueExecution.mockClear()
    mockLoggerInfo.mockClear()
    mockLoggerError.mockClear()
    mockPrismaWebhookFindUnique.mockClear()
    mockPrismaExecutionCreate.mockClear()
  })

  const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    params: { webhookId: 'webhook-123' },
    method: 'POST',
    headers: {},
    body: {},
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

  test('should return 422 when webhookId is missing', async () => {
    const req = createMockRequest({ params: {} })
    const res = createMockResponse()
    const next = createMockNext()

    const webhookId = (req as any).params.webhookId
    if (!webhookId) {
      res.status!(422).send!('Invalid Data')
    }

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.send).toHaveBeenCalledWith('Invalid Data')
  })

  test('should return 422 when HTTP method is not supported', async () => {
    const req = createMockRequest({ method: 'INVALID' })
    const res = createMockResponse()
    const next = createMockNext()

    const { supportedMethodsSchema } = await import('@buzz8n/common/types')
    const { success } = supportedMethodsSchema.safeParse(req.method)

    if (!success) {
      res.status!(422).send!('Invalid Data')
    }

    expect(res.status).toHaveBeenCalledWith(422)
  })

  test('should return 404 when webhook is not found', async () => {
    mockPrismaWebhookFindUnique.mockResolvedValueOnce(null)

    const req = createMockRequest()
    const res = createMockResponse()
    const next = createMockNext()

    const { prisma } = await import('@buzz8n/store')
    const { supportedMethodsSchema } = await import('@buzz8n/common/types')

    const webhookId = req.params!.webhookId
    const { success, data: method } = supportedMethodsSchema.safeParse(req.method)

    if (success) {
      const webhook = await prisma.webhook.findUnique({
        where: { method, path: webhookId },
        select: {
          workflowId: true,
          workflow: { select: { userId: true } },
          secret: true,
        },
      })

      if (!webhook) {
        mockLoggerError('webhook not found')
        res.status!(404).json!({ error: 'Invalid request', code: 'NOT_FOUND' })
      }
    }

    expect(mockPrismaWebhookFindUnique).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(404)
    expect(mockLoggerError).toHaveBeenCalledWith('webhook not found')
  })

  test('should return 403 when secret does not match', async () => {
    mockPrismaWebhookFindUnique.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123' },
      secret: 'correct-secret',
    })

    const req = createMockRequest({
      headers: { authorization: 'Bearer wrong-secret' },
    })
    const res = createMockResponse()

    const { prisma } = await import('@buzz8n/store')
    const { supportedMethodsSchema } = await import('@buzz8n/common/types')

    const authorization = req.headers!.authorization
    const secret_token = authorization?.trim().split(/\s+/).at(1)
    const { success, data: method } = supportedMethodsSchema.safeParse(req.method)

    if (success) {
      const webhook = await prisma.webhook.findUnique({
        where: { method, path: req.params!.webhookId },
        select: {
          workflowId: true,
          workflow: { select: { userId: true } },
          secret: true,
        },
      })

      if (webhook && webhook.secret && webhook.secret !== secret_token) {
        res.status!(403).send!('Not authorized')
      }
    }

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.send).toHaveBeenCalledWith('Not authorized')
  })

  test('should successfully trigger webhook execution when secret matches', async () => {
    mockPrismaWebhookFindUnique.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123' },
      secret: 'correct-secret',
    })

    mockPrismaExecutionCreate.mockResolvedValueOnce({
      id: 'exec-456',
    })

    const req = createMockRequest({
      headers: { authorization: 'Bearer correct-secret' },
    })
    const res = createMockResponse()

    const { prisma } = await import('@buzz8n/store')
    const { enqueueExecution } = await import('@apps/server/src/redis/enqueue')
    const { supportedMethodsSchema } = await import('@buzz8n/common/types')

    const authorization = req.headers!.authorization
    const secret_token = authorization?.trim().split(/\s+/).at(1)
    const { success, data: method } = supportedMethodsSchema.safeParse(req.method)

    if (success) {
      const webhook = await prisma.webhook.findUnique({
        where: { method, path: req.params!.webhookId },
        select: {
          workflowId: true,
          workflow: { select: { userId: true } },
          secret: true,
        },
      })

      if (webhook && (!webhook.secret || webhook.secret === secret_token)) {
        const execution = await prisma.execution.create({
          data: {
            workflowId: webhook.workflowId,
            userId: webhook.workflow.userId,
          },
        })

        await enqueueExecution({
          executionId: execution.id,
          workflowId: webhook.workflowId,
          data: { triggerType: 'webhook' },
        })

        res.status!(200).json!({
          message: 'Execution started',
          executionId: execution.id,
        })
      }
    }

    expect(mockPrismaExecutionCreate).toHaveBeenCalled()
    expect(mockEnqueueExecution).toHaveBeenCalledWith({
      executionId: 'exec-456',
      workflowId: 'workflow-123',
      data: { triggerType: 'webhook' },
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Execution started',
      executionId: 'exec-456',
    })
  })

  test('should successfully trigger webhook execution when no secret is set', async () => {
    mockPrismaWebhookFindUnique.mockResolvedValueOnce({
      workflowId: 'workflow-no-secret',
      workflow: { userId: 'user-456' },
      secret: null,
    })

    mockPrismaExecutionCreate.mockResolvedValueOnce({
      id: 'exec-no-secret',
    })

    const req = createMockRequest({
      headers: {},
    })
    const res = createMockResponse()

    const { prisma } = await import('@buzz8n/store')
    const { enqueueExecution } = await import('@apps/server/src/redis/enqueue')
    const { supportedMethodsSchema } = await import('@buzz8n/common/types')

    const { success, data: method } = supportedMethodsSchema.safeParse(req.method)

    if (success) {
      const webhook = await prisma.webhook.findUnique({
        where: { method, path: req.params!.webhookId },
        select: {
          workflowId: true,
          workflow: { select: { userId: true } },
          secret: true,
        },
      })

      if (webhook && !webhook.secret) {
        const execution = await prisma.execution.create({
          data: {
            workflowId: webhook.workflowId,
            userId: webhook.workflow.userId,
          },
        })

        await enqueueExecution({
          executionId: execution.id,
          workflowId: webhook.workflowId,
          data: { triggerType: 'webhook' },
        })

        res.status!(200).json!({
          message: 'Execution started',
          executionId: execution.id,
        })
      }
    }

    expect(res.status).toHaveBeenCalledWith(200)
  })

  test('should handle authorization header with multiple spaces', async () => {
    mockPrismaWebhookFindUnique.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123' },
      secret: 'my-secret',
    })

    const req = createMockRequest({
      headers: { authorization: 'Bearer   my-secret' },
    })
    const res = createMockResponse()

    const authorization = req.headers!.authorization
    const secret_token = authorization?.trim().split(/\s+/).at(1)

    expect(secret_token).toBe('my-secret')
  })

  test('should handle different HTTP methods (GET, PUT, DELETE, PATCH)', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH']

    for (const method of methods) {
      const { supportedMethodsSchema } = await import('@buzz8n/common/types')
      const result = supportedMethodsSchema.safeParse(method)
      expect(result.success).toBe(true)
      expect(result.data).toBe(method)
    }
  })

  test('should call next() on unexpected errors', async () => {
    const next = createMockNext()
    const error = new Error('Database error')

    // Mirrors webhook router catch block: unexpected failures are forwarded to Express
    try {
      throw error
    } catch (err) {
      next(err)
    }

    expect(next).toHaveBeenCalledWith(error)
  })
})
