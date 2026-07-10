import { describe, test, expect, beforeEach, mock } from 'bun:test'
import express from 'express'

type MockWebhook = {
  workflowId: string
  workflow: { userId: string; active: boolean }
  secret: string | null
}

type MockExecution = {
  id: string
}

const mockEnqueueExecution = mock(() => Promise.resolve())
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
    error: mock(() => {}),
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
}))

const { webhookRouter } = await import('../../../../apps/server/src/routers/webhook')

async function postWebhook(body: unknown) {
  const app = express()
  app.use(express.json())
  app.use(webhookRouter)

  const server = app.listen(0)
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  try {
    const response = await fetch(
      `http://127.0.0.1:${port}/webhook/customer-created?source=crm&tag=first&tag=second`,
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer webhook-secret',
          cookie: 'session=sensitive',
          'content-type': 'application/json',
          'x-custom-header': 'keep-me',
        },
        body: JSON.stringify(body),
      },
    )

    return response
  } finally {
    server.close()
  }
}

describe('Webhook Router payload forwarding', () => {
  beforeEach(() => {
    mockEnqueueExecution.mockClear()
    mockPrismaWebhookFindFirst.mockClear()
    mockPrismaExecutionCreate.mockClear()
  })

  test('enqueues webhook executions with sanitized request context and body', async () => {
    const requestBody = {
      customerId: 'cus_123',
      nested: { active: true },
    }

    mockPrismaWebhookFindFirst.mockResolvedValueOnce({
      workflowId: 'workflow-123',
      workflow: { userId: 'user-123', active: true },
      secret: 'webhook-secret',
    })
    mockPrismaExecutionCreate.mockResolvedValueOnce({ id: 'exec-456' })

    const response = await postWebhook(requestBody)

    expect(response.status).toBe(202)
    expect(mockEnqueueExecution).toHaveBeenCalledTimes(1)
    expect(mockEnqueueExecution).toHaveBeenCalledWith({
      executionId: 'exec-456',
      workflowId: 'workflow-123',
      data: {
        triggerType: 'webhook',
        method: 'POST',
        path: 'customer-created',
        headers: expect.objectContaining({
          'content-type': 'application/json',
          'x-custom-header': 'keep-me',
        }),
        query: {
          source: 'crm',
          tag: 'first,second',
        },
        body: requestBody,
      },
    })

    const enqueueCall = mockEnqueueExecution.mock.calls[0]
    expect(enqueueCall).toBeDefined()

    const [{ data }] = enqueueCall!
    expect(data.headers).not.toHaveProperty('authorization')
    expect(data.headers).not.toHaveProperty('cookie')
  })
})
