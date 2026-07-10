import type {
  EnqueueExecutionPayload,
  ManualTriggerData,
  WebhookTriggerData,
} from '@buzz8n/backend-common/types'
import { describe, test, expect } from 'bun:test'

describe('EnqueueExecutionPayload Type', () => {
  test('accepts webhook trigger data with request context', () => {
    const webhookData: WebhookTriggerData = {
      triggerType: 'webhook',
      method: 'POST',
      path: 'customer-created',
      headers: {
        'content-type': 'application/json',
        'x-source': 'crm',
      },
      query: {
        source: 'crm',
      },
      body: {
        customerId: 'cus-123',
      },
    }

    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: webhookData,
    }

    expect(payload.executionId).toBe('exec-123')
    expect(payload.workflowId).toBe('workflow-456')
    expect(payload.data).toEqual(webhookData)
  })

  test('accepts manual trigger data without a body', () => {
    const manualData: ManualTriggerData = {
      triggerType: 'manualTrigger',
    }

    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: manualData,
    }

    expect(payload.data).toEqual(manualData)
  })

  test('accepts manual trigger data with a body', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {
        triggerType: 'manualTrigger',
        body: {
          requestedBy: 'user-123',
        },
      },
    }

    expect(payload.data).toEqual({
      triggerType: 'manualTrigger',
      body: {
        requestedBy: 'user-123',
      },
    })
  })

  test('requires execution and workflow IDs alongside trigger data', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123',
      workflowId: 'workflow-456',
      data: {
        triggerType: 'manualTrigger',
      },
    }

    expect(payload).toHaveProperty('executionId')
    expect(payload).toHaveProperty('workflowId')
    expect(payload).toHaveProperty('data')
  })

  test('handles special characters in IDs', () => {
    const payload: EnqueueExecutionPayload = {
      executionId: 'exec-123-abc_def',
      workflowId: 'workflow-456-xyz_uvw',
      data: {
        triggerType: 'manualTrigger',
      },
    }

    expect(payload.executionId).toContain('_')
    expect(payload.workflowId).toContain('_')
  })
})
