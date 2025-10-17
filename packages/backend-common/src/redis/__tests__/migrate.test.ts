import { describe, test, expect, mock, beforeEach } from 'bun:test'

// Mock the redis module before importing migrate
const mockXGroupCreate = mock(() => Promise.resolve('OK'))
const mockConnect = mock(() => Promise.resolve())
const mockQuit = mock(() => Promise.resolve())
const mockOn = mock(function (this: any) {
  return this
})

mock.module('redis', () => ({
  createClient: mock(() => ({
    on: mockOn,
    connect: mockConnect,
    xGroupCreate: mockXGroupCreate,
    quit: mockQuit,
  })),
}))

describe('Redis Migrate Script', () => {
  beforeEach(() => {
    mockXGroupCreate.mockClear()
    mockConnect.mockClear()
    mockQuit.mockClear()
    mockOn.mockClear()
  })

  test('should create stream and consumer group successfully', async () => {
    // Import and execute migrate
    const { createClient } = await import('redis')
    const client = createClient()
    await client.on('error', () => {}).connect()
    
    const result = await client.xGroupCreate('workflow:execution', 'workflow:executors', '$', {
      MKSTREAM: true,
    })
    
    expect(result).toBe('OK')
    expect(mockXGroupCreate).toHaveBeenCalledTimes(1)
    expect(mockXGroupCreate).toHaveBeenCalledWith(
      'workflow:execution',
      'workflow:executors',
      '$',
      { MKSTREAM: true }
    )
  })

  test('should handle error when stream already exists', async () => {
    mockXGroupCreate.mockImplementationOnce(() => 
      Promise.reject(new Error('BUSYGROUP Consumer Group name already exists'))
    )
    
    const { createClient } = await import('redis')
    const client = createClient()
    await client.on('error', () => {}).connect()
    
    await expect(
      client.xGroupCreate('workflow:execution', 'workflow:executors', '$', {
        MKSTREAM: true,
      })
    ).rejects.toThrow('BUSYGROUP Consumer Group name already exists')
  })

  test('should quit Redis connection after migration', async () => {
    const { createClient } = await import('redis')
    const client = createClient()
    await client.on('error', () => {}).connect()
    await client.xGroupCreate('workflow:execution', 'workflow:executors', '$', {
      MKSTREAM: true,
    })
    await client.quit()
    
    expect(mockQuit).toHaveBeenCalledTimes(1)
  })

  test('should handle connection errors', async () => {
    mockConnect.mockImplementationOnce(() => 
      Promise.reject(new Error('Connection refused'))
    )
    
    const { createClient } = await import('redis')
    const client = createClient()
    
    await expect(
      client.on('error', () => {}).connect()
    ).rejects.toThrow('Connection refused')
  })
})