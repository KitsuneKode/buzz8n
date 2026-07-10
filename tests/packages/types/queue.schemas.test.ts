import {
  enqueueExecutionPayloadSchema,
  parseEnqueueExecutionPayload,
  webhookTriggerDataSchema,
} from '@buzz8n/backend-common/types'
import { describe, expect, test } from 'bun:test'

describe('parseEnqueueExecutionPayload', () => {
  const webhookData = {
    triggerType: 'webhook' as const,
    method: 'POST',
    path: 'customer-created',
    headers: { 'content-type': 'application/json' },
    query: { source: 'crm' },
    body: { customerId: 'cus-123' },
  }

  test('accepts wire format with stringified data field', () => {
    const result = parseEnqueueExecutionPayload({
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: JSON.stringify(webhookData),
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        executionId: 'exec-123',
        workflowId: 'workflow-456',
        data: webhookData,
      })
    }
  })

  test('accepts wire format with parsed data object', () => {
    const result = parseEnqueueExecutionPayload({
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {
        triggerType: 'manualTrigger',
        body: { requestedBy: 'user-123' },
      },
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toEqual({
        triggerType: 'manualTrigger',
        body: { requestedBy: 'user-123' },
      })
    }
  })

  test('accepts top-level JSON string message', () => {
    const result = parseEnqueueExecutionPayload(
      JSON.stringify({
        executionId: 'exec-123',
        workflowId: 'workflow-456',
        data: JSON.stringify({ triggerType: 'manualTrigger' }),
      }),
    )

    expect(result.success).toBe(true)
  })

  test('rejects missing executionId', () => {
    const result = parseEnqueueExecutionPayload({
      workflowId: 'workflow-456',
      data: JSON.stringify({ triggerType: 'manualTrigger' }),
    })

    expect(result.success).toBe(false)
  })

  test('rejects invalid trigger data JSON', () => {
    const result = parseEnqueueExecutionPayload({
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: '{not-json',
    })

    expect(result.success).toBe(false)
  })

  test('rejects unknown trigger type', () => {
    const result = parseEnqueueExecutionPayload({
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: JSON.stringify({ triggerType: 'schedule' }),
    })

    expect(result.success).toBe(false)
  })

  test('rejects invalid top-level JSON string', () => {
    const result = parseEnqueueExecutionPayload('{bad-json')

    expect(result.success).toBe(false)
  })
})

describe('enqueueExecutionPayloadSchema', () => {
  test('validates parsed payload shape', () => {
    const result = enqueueExecutionPayloadSchema.safeParse({
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {
        triggerType: 'manualTrigger',
      },
    })

    expect(result.success).toBe(true)
  })
})

describe('webhookTriggerDataSchema', () => {
  test('requires webhook trigger fields', () => {
    const result = webhookTriggerDataSchema.safeParse({
      triggerType: 'webhook',
      method: 'GET',
      path: 'health',
      headers: {},
      query: {},
      body: null,
    })

    expect(result.success).toBe(true)
  })
})
