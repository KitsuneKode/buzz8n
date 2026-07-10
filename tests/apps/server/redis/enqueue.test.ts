import { describe, test, expect, beforeEach, mock } from 'bun:test'

// Mock the redis client and logger before importing
const mockXAdd = mock(() => Promise.resolve('1234567890-0'))
const mockConnect = mock(() => Promise.resolve())

mock.module('@/redis', () => ({
  redis: {
    connect: mockConnect,
    xAdd: mockXAdd,
    LOG_GROUP: '[REDIS]',
  },
}))

const mockLoggerInfo = mock(() => {})
const mockLoggerError = mock(() => {})

mock.module('@/utils/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}))

// Import after mocks are set up
const { enqueueExecution } = await import('../../../../apps/server/src/redis/enqueue')

describe('enqueueExecution', () => {
  beforeEach(() => {
    mockXAdd.mockClear()
    mockLoggerInfo.mockClear()
    mockLoggerError.mockClear()
  })

  test('should enqueue execution successfully with valid payload', async () => {
    const payload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: { action: 'test', data: 'sample' },
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalledTimes(1)
    expect(mockXAdd).toHaveBeenCalledWith({
      payload: {
        executionId: 'exec-123',
        workflowId: 'workflow-456',
        data: JSON.stringify({ action: 'test', data: 'sample' }),
      },
    })
    expect(mockLoggerInfo).toHaveBeenCalledWith('[REDIS] Execution is queued', {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
    })
  })

  test('should enqueue execution with empty payload', async () => {
    const payload = {
      executionId: 'exec-empty',
      workflowId: 'workflow-empty',
      data: {},
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalledWith({
      payload: {
        executionId: 'exec-empty',
        workflowId: 'workflow-empty',
        data: JSON.stringify({}),
      },
    })
  })

  test('should enqueue execution with null payload', async () => {
    const payload = {
      executionId: 'exec-null',
      workflowId: 'workflow-null',
      data: null,
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalledWith({
      payload: {
        executionId: 'exec-null',
        workflowId: 'workflow-null',
        data: JSON.stringify(null),
      },
    })
  })

  test('should enqueue execution with complex nested payload', async () => {
    const payload = {
      executionId: 'exec-complex',
      workflowId: 'workflow-complex',
      data: {
        user: { id: 1, name: 'John' },
        items: [
          { id: 'a', qty: 5 },
          { id: 'b', qty: 10 },
        ],
        metadata: { timestamp: '2024-01-01', source: 'api' },
      },
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalledTimes(1)
    const callArgs = (mockXAdd as any).mock.calls[0][0]
    expect(callArgs.payload.data).toContain('John')
    expect(callArgs.payload.data).toContain('metadata')
  })

  test('should handle Redis xAdd error and throw with context', async () => {
    mockXAdd.mockRejectedValueOnce(new Error('Redis connection timeout'))

    const payload = {
      executionId: 'exec-error',
      workflowId: 'workflow-error',
      data: { test: 'data' },
    }

    await expect(enqueueExecution(payload)).rejects.toThrow(
      '[REDIS] Error queuing execution: exec-error , workflow-error',
    )

    expect(mockLoggerError).toHaveBeenCalledWith(
      '[REDIS] Error queuing execution',
      expect.objectContaining({
        executionId: 'exec-error',
        workflowId: 'workflow-error',
        error: expect.any(Error),
      }),
    )
  })

  test('should handle xAdd network error', async () => {
    mockXAdd.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    const payload = {
      executionId: 'exec-network',
      workflowId: 'workflow-network',
      data: {},
    }

    await expect(enqueueExecution(payload)).rejects.toThrow()
    expect(mockLoggerError).toHaveBeenCalled()
  })

  test('should serialize payload with special characters', async () => {
    const payload = {
      executionId: 'exec-special',
      workflowId: 'workflow-special',
      data: {
        text: 'Special chars: "quotes", \'apostrophes\', \\backslashes\\',
        unicode: '你好世界 🚀',
      },
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalled()
    const callArgs = (mockXAdd as any).mock.calls[0][0]
    const parsedData = JSON.parse(callArgs.payload.data)
    expect(parsedData.unicode).toBe('你好世界 🚀')
  })

  test('should handle array payload', async () => {
    const payload = {
      executionId: 'exec-array',
      workflowId: 'workflow-array',
      data: [1, 2, 3, 4, 5],
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalled()
    const callArgs = (mockXAdd as any).mock.calls[0][0]
    expect(JSON.parse(callArgs.payload.data)).toEqual([1, 2, 3, 4, 5])
  })

  test('should handle string payload', async () => {
    const payload = {
      executionId: 'exec-string',
      workflowId: 'workflow-string',
      data: 'simple string payload',
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalled()
    const callArgs = (mockXAdd as any).mock.calls[0][0]
    expect(JSON.parse(callArgs.payload.data)).toBe('simple string payload')
  })

  test('should handle number payload', async () => {
    const payload = {
      executionId: 'exec-number',
      workflowId: 'workflow-number',
      data: 42,
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalled()
    const callArgs = (mockXAdd as any).mock.calls[0][0]
    expect(JSON.parse(callArgs.payload.data)).toBe(42)
  })

  test('should handle boolean payload', async () => {
    const payload = {
      executionId: 'exec-bool',
      workflowId: 'workflow-bool',
      data: true,
    }

    await enqueueExecution(payload)

    expect(mockXAdd).toHaveBeenCalled()
    const callArgs = (mockXAdd as any).mock.calls[0][0]
    expect(JSON.parse(callArgs.payload.data)).toBe(true)
  })
})
