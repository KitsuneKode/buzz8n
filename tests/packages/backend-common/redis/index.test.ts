import { RedisClient } from '@packages/backend-common/src/redis'
import { describe, test, expect, mock } from 'bun:test'

// Mock the redis module
mock.module('redis', () => ({
  createClient: mock(() => ({
    on: mock(function (this: any) {
      return this
    }),
    connect: mock(() => Promise.resolve()),
    xAdd: mock(() => Promise.resolve('1234567890-0')),
    xReadGroup: mock(() => Promise.resolve(null)),
    xAck: mock(() => Promise.resolve(1)),
    quit: mock(() => Promise.resolve()),
  })),
}))

// Mock config and logger modules
mock.module('@packages/backend-common/src/utils/config', () => ({
  backendConfig: {
    getConfig: mock((key: string) => {
      if (key === 'redisUrl') return 'redis://localhost:6379'
      return null
    }),
  },
  workerConfig: {
    getConfig: mock((key: string) => {
      if (key === 'redisUrl') return 'redis://worker:6379'
      return null
    }),
  },
}))

mock.module('@packages/backend-common/src/utils/logger', () => ({
  backendLogger: {
    error: mock(() => {}),
    info: mock(() => {}),
  },
  workerLogger: {
    error: mock(() => {}),
    info: mock(() => {}),
  },
}))

describe('RedisClient', () => {
  describe('constructor', () => {
    test('should create RedisClient instance for server service', () => {
      const client = new RedisClient('server')
      expect(client).toBeDefined()
      expect(client.LOG_GROUP).toBe('[REDIS]')
    })

    test('should create RedisClient instance for worker service', () => {
      const client = new RedisClient('worker')
      expect(client).toBeDefined()
      expect(client.LOG_GROUP).toBe('[REDIS]')
    })
  })

  describe('connect', () => {
    test('should connect to Redis successfully', async () => {
      const client = new RedisClient('server')
      await expect(client.connect()).resolves.toBeUndefined()
    })

    test('should register error handler on connection', async () => {
      const client = new RedisClient('server')
      await client.connect()
    })
  })

  describe('xAdd', () => {
    test('should add message to stream with default parameters', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xAdd({
        payload: {
          executionId: 'exec-123',
          workflowId: 'workflow-456',
          data: JSON.stringify({ test: 'data' }),
        },
      })

      expect(result).toBeDefined()
    })

    test('should add message to stream with custom stream key', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xAdd({
        payload: { key: 'value' },
        streamKey: 'custom:stream',
      })

      expect(result).toBeDefined()
    })

    test('should add message to stream with custom maxlen', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xAdd({
        payload: { key: 'value' },
        maxlen: 5000,
      })

      expect(result).toBeDefined()
    })

    test('should handle payload with complex nested objects', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const complexPayload = {
        id: '123',
        nested: {
          data: {
            values: [1, 2, 3],
          },
        },
        array: ['a', 'b', 'c'],
      }

      const result = await client.xAdd({
        payload: complexPayload,
      })

      expect(result).toBeDefined()
    })
  })

  describe('xReadGroup', () => {
    test('should read messages from consumer group with default parameters', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xReadGroup({
        consumerGroup: 'consumer-1',
      })

      expect(result).toBeDefined()
    })

    test('should read messages from consumer group with custom read group', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xReadGroup({
        readGroup: 'custom:group',
        consumerGroup: 'consumer-2',
      })

      expect(result).toBeDefined()
    })

    test('should read messages from consumer group with custom stream key', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xReadGroup({
        consumerGroup: 'consumer-3',
        streamKey: 'custom:execution',
      })

      expect(result).toBeDefined()
    })

    test('should handle empty consumer group name', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xReadGroup({
        consumerGroup: '',
      })

      expect(result).toBeDefined()
    })
  })

  describe('xAck', () => {
    test('should acknowledge message successfully', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xAck({
        streamId: 'workflow:execution',
        consumerGroup: 'workflow:executors',
        messageID: '1234567890-0',
      })

      expect(result).toBe(1)
    })

    test('should handle acknowledgement with different stream IDs', async () => {
      const client = new RedisClient('server')
      await client.connect()

      const result = await client.xAck({
        streamId: 'custom:stream',
        consumerGroup: 'custom:group',
        messageID: '9876543210-1',
      })

      expect(result).toBeDefined()
    })
  })

  describe('cleanup', () => {
    test('should disconnect from Redis gracefully', async () => {
      const client = new RedisClient('server')
      await client.connect()
      await expect(client.cleanup()).resolves.toBeUndefined()
    })

    test('should handle cleanup when not connected', async () => {
      const client = new RedisClient('server')
      await expect(client.cleanup()).resolves.toBeUndefined()
    })
  })

  describe('integration scenarios', () => {
    test('should handle full lifecycle: connect, add, read, ack, cleanup', async () => {
      const client = new RedisClient('server')

      await client.connect()

      const addResult = await client.xAdd({
        payload: {
          executionId: 'exec-789',
          workflowId: 'workflow-012',
          data: JSON.stringify({ action: 'test' }),
        },
      })
      expect(addResult).toBeDefined()

      const readResult = await client.xReadGroup({
        consumerGroup: 'test-consumer',
      })
      expect(readResult).toBeDefined()

      await client.cleanup()
    })

    test('should handle multiple operations in sequence', async () => {
      const client = new RedisClient('worker')
      await client.connect()

      await client.xAdd({ payload: { id: '1' } })
      await client.xAdd({ payload: { id: '2' } })
      await client.xAdd({ payload: { id: '3' } })

      await client.xReadGroup({ consumerGroup: 'multi-consumer' })

      await client.cleanup()
    })
  })

  describe('error handling', () => {
    test('should propagate Redis connection errors', async () => {
      const mockCreateClient = mock(() => ({
        on: mock(function (this: any) {
          return this
        }),
        connect: mock(() => Promise.reject(new Error('Connection failed'))),
        quit: mock(() => Promise.resolve()),
      }))

      mock.module('redis', () => ({
        createClient: mockCreateClient,
      }))

      const client = new RedisClient('server')
      await expect(client.connect()).rejects.toThrow('Connection failed')
    })
  })
})
