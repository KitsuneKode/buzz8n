import { describe, test, expect, beforeEach, mock } from 'bun:test'
import express from 'express'
import * as commonTypes from '../../../../packages/common/src/types'

type MockWebhook = {
  workflowId: string
  workflow: { userId: string; active: boolean }
  secret: string | null
}

type MockExecution = {
  id: string
}

const mockEnqueueExecution = mock(() => Promise.resolve())
const mockLoggerError = mock(() => {})
const mockPrismaWebhookFindFirst = mock((): Promise<MockWebhook | null> => Promise.resolve(null))
const mockPrismaExecutionCreate = mock(
  (): Promise<MockExecution> => Promise.resolve({ id: 'exec-123' }),
)

mock.module('@/middlewares/rate-limiter-middleware', () => ({
  rateLimitMiddleware: {
    webhook: (_req: unknown, _res: unknown, next: () => void) => next(),
  },
}))

mock.module('@/redis/enqueue', () => ({
  enqueueExecution: mockEnqueueExecution,
}))

mock.module('@/utils/logger', () => ({
  logger: {
    info: mock(() => {}),
    error: mockLoggerError,
  },
}))

mock.module('@buzz8n/store', () => ({
  prisma: {
    webhook: {
      findFirst: mockPrismaWebhookFindFirst,
    },
    execution: {
      create: mockPrismaExecutionCreate,
    },
  },
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string
    constructor(message: string, { code }: { code: string }) {
      super(message)
      this.code = code
    }
  },
}))

mock.module('@buzz8n/common/types', () => ({
  ...commonTypes,
  supportedMethodsSchema: {
    safeParse: mock((method: string) => {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      if (validMethods.includes(method)) {
        return { success: true, data: method }
      }
      return { success: false }
    }),
  },
}))

const { webhookRouter } = await import('../../../../apps/server/src/routers/webhook')

type RequestOptions = {
  method?: string
  path?: string
  headers?: Record<string, string>
  body?: unknown
}

async function requestWebhook({
  method = 'POST',
  path = '/webhook/webhook-123',
  headers = {},
  body = {},
}: RequestOptions = {}) {
  const app = express()
  app.use(express.json())
  app.use(webhookRouter)
  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: error.message })
  })

  const server = app.listen(0)
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  try {
    const methodAllowsBody = !['GET', 'HEAD', 'OPTIONS'].includes(method)
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: methodAllowsBody ? JSON.stringify(body) : undefined,
    })
    const text = await response.text()
    let responseBody: unknown = text
    try {
      responseBody = JSON.parse(text)
    } catch {
      // Plain-text error responses are expected for several webhook branches.
    }

    return { status: response.status, body: responseBody }
  } finally {
    server.close()
  }
}

describe('Webhook Router', () => {
  beforeEach(() => {
    mockEnqueueExecution.mockClear()
    mockLoggerError.mockClear()
    mockPrismaWebhookFindFirst.mockClear()
    mockPrismaExecutionCreate.mockClear()
  })

  test('returns 422 when HTTP method is not supported', async () => {
    const response = await requestWebhook({ method: 'OPTIONS' })

    expect(response.status).toBe(422)
    expect(response.body).toEqual({ error: 'Invalid Data' })
    expect(mockPrismaWebhookFindFirst).not.toHaveBeenCalled()
  })

  test('returns 404 when webhook is not found', async () => {
    mockPrismaWebhookFindFirst.mockResolvedValueOnce(null)

    const response = await requestWebhook()

    expect(mockPrismaWebhookFindFirst).toHaveBeenCalledWith({
      where: {
        method: 'POST',
        path: 'webhook-123',
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
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Invalid Request' })
    expect(mockLoggerError).toHaveBeenCalledWith('webhook not found')
  })

  test('returns 403 when secret does not match', async () => {
    mockPrismaWebhookFindFirst.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123', active: true },
      secret: 'correct-secret',
    })

    const response = await requestWebhook({
      headers: { authorization: 'Bearer wrong-secret' },
    })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      error: 'Webhook called with invalid secret. Not authorized',
    })
    expect(mockEnqueueExecution).not.toHaveBeenCalled()
  })

  test('returns 409 when workflow is inactive', async () => {
    mockPrismaWebhookFindFirst.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123', active: false },
      secret: null,
    })

    const response = await requestWebhook()

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      error: 'Workflow is not active to execute. Please activate the workflow first.',
    })
    expect(mockEnqueueExecution).not.toHaveBeenCalled()
  })

  test('successfully triggers webhook execution when secret matches', async () => {
    mockPrismaWebhookFindFirst.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123', active: true },
      secret: 'correct-secret',
    })
    mockPrismaExecutionCreate.mockResolvedValueOnce({
      id: 'exec-456',
    })

    const response = await requestWebhook({
      headers: { authorization: 'Bearer correct-secret' },
      body: { ok: true },
    })

    expect(response.status).toBe(202)
    expect(response.body).toEqual({
      message: 'Execution accepted',
      executionId: 'exec-456',
    })
    expect(mockPrismaExecutionCreate).toHaveBeenCalledWith({
      data: {
        workflowId: 'workflow-123',
        userId: 'user-123',
      },
    })
    expect(mockEnqueueExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        executionId: 'exec-456',
        workflowId: 'workflow-123',
        data: expect.objectContaining({
          triggerType: 'webhook',
          body: { ok: true },
        }),
      }),
    )
  })

  test('successfully triggers webhook execution when no secret is set', async () => {
    mockPrismaWebhookFindFirst.mockResolvedValueOnce({
      workflowId: 'workflow-no-secret',
      workflow: { userId: 'user-456', active: true },
      secret: null,
    })
    mockPrismaExecutionCreate.mockResolvedValueOnce({
      id: 'exec-no-secret',
    })

    const response = await requestWebhook({
      headers: {},
    })

    expect(response.status).toBe(202)
    expect(response.body).toEqual({
      message: 'Execution accepted',
      executionId: 'exec-no-secret',
    })
  })

  test('handles authorization header with multiple spaces', async () => {
    mockPrismaWebhookFindFirst.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123', active: true },
      secret: 'my-secret',
    })
    mockPrismaExecutionCreate.mockResolvedValueOnce({
      id: 'exec-456',
    })

    const response = await requestWebhook({
      headers: { authorization: 'Bearer   my-secret' },
    })

    expect(response.status).toBe(202)
  })

  test('handles different HTTP methods (GET, PUT, DELETE, PATCH)', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH']

    for (const method of methods) {
      mockPrismaWebhookFindFirst.mockResolvedValueOnce({
        workflowId: `workflow-${method}`,
        workflow: { userId: 'user-123', active: true },
        secret: null,
      })
      mockPrismaExecutionCreate.mockResolvedValueOnce({
        id: `exec-${method}`,
      })

      const response = await requestWebhook({ method })

      expect(response.status).toBe(202)
    }
  })

  test('passes unexpected errors to error middleware', async () => {
    mockPrismaWebhookFindFirst.mockRejectedValueOnce(new Error('Database error'))

    const response = await requestWebhook()

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Database error' })
  })
})
