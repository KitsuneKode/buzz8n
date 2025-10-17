import { describe, test, expect } from 'bun:test'
import type { EnqueueExecutionPayload } from '../queue'

describe('EnqueueExecutionPayload Type', () => {
  test('should accept valid payload with all required fields', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: { data: 'test' },
    }
    
    expect(payload.executionId).toBe('exec-123')
    expect(payload.workflowId).toBe('workflow-456')
    expect(payload.payload).toEqual({ data: 'test' })
  })

  test('should accept payload with null', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: null,
    }
    
    expect(payload.payload).toBeNull()
  })

  test('should accept payload with undefined', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: undefined,
    }
    
    expect(payload.payload).toBeUndefined()
  })

  test('should accept payload with object', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: {
        user: { id: 1, name: 'John' },
        action: 'create',
        timestamp: '2024-01-01',
      },
    }
    
    expect(typeof payload.payload).toBe('object')
  })

  test('should accept payload with array', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: [1, 2, 3, 4, 5],
    }
    
    expect(Array.isArray(payload.payload)).toBe(true)
  })

  test('should accept payload with string', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: 'simple string payload',
    }
    
    expect(typeof payload.payload).toBe('string')
  })

  test('should accept payload with number', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: 42,
    }
    
    expect(typeof payload.payload).toBe('number')
  })

  test('should accept payload with boolean', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: true,
    }
    
    expect(typeof payload.payload).toBe('boolean')
  })

  test('should accept empty object as payload', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: {},
    }
    
    expect(payload.payload).toEqual({})
  })

  test('should accept deeply nested object as payload', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      },
    }
    
    expect((payload.payload as any).level1.level2.level3.value).toBe('deep')
  })

  test('should validate required fields are present', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      payload: {},
    }
    
    expect(payload).toHaveProperty('executionId')
    expect(payload).toHaveProperty('workflowId')
    expect(payload).toHaveProperty('payload')
  })

  test('should handle special characters in IDs', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123-abc_def',
      workflowId: 'workflow-456-xyz_uvw',
      payload: {},
    }
    
    expect(payload.executionId).toContain('_')
    expect(payload.workflowId).toContain('_')
  })
})