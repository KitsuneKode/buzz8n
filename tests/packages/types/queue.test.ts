import type { EnqueueExecutionPayload } from '@buzz8n/backend-common/types'
import { describe, test, expect } from 'bun:test'

describe('EnqueueExecutionPayload Type', () => {
  test('should accept valid payload with all required fields', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: { data: 'test' },
    }

    expect(payload.executionId).toBe('exec-123')
    expect(payload.workflowId).toBe('workflow-456')
    expect(payload.data).toEqual({ data: 'test' })
  })

  test('should accept data with null', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: null,
    }

    expect(payload.data).toBeNull()
  })

  test('should accept data with undefined', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: undefined,
    }

    expect(payload.data).toBeUndefined()
  })

  test('should accept data with object', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {
        user: { id: 1, name: 'John' },
        action: 'create',
        timestamp: '2024-01-01',
      },
    }

    expect(typeof payload.data).toBe('object')
  })

  test('should accept data with array', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: [1, 2, 3, 4, 5],
    }

    expect(Array.isArray(payload.data)).toBe(true)
  })

  test('should accept data with string', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: 'simple string payload',
    }

    expect(typeof payload.data).toBe('string')
  })

  test('should accept data with number', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: 42,
    }

    expect(typeof payload.data).toBe('number')
  })

  test('should accept data with boolean', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: true,
    }

    expect(typeof payload.data).toBe('boolean')
  })

  test('should accept empty object as data', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {},
    }

    expect(payload.data).toEqual({})
  })

  test('should accept deeply nested object as data', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      },
    }

    expect((payload.data as any).level1.level2.level3.value).toBe('deep')
  })

  test('should validate required fields are present', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {},
    }

    expect(payload).toHaveProperty('executionId')
    expect(payload).toHaveProperty('workflowId')
    expect(payload).toHaveProperty('data')
  })

  test('should handle special characters in IDs', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123-abc_def',
      workflowId: 'workflow-456-xyz_uvw',
      data: {},
    }

    expect(payload.executionId).toContain('_')
    expect(payload.workflowId).toContain('_')
  })
})
