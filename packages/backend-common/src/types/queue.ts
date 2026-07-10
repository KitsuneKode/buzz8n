export type WebhookTriggerData = {
  triggerType: 'webhook'
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: unknown
}

export type ManualTriggerData = {
  triggerType: 'manualTrigger'
  body?: unknown
}

export interface EnqueueExecutionPayload {
  executionId: string
  workflowId: string
  data: WebhookTriggerData | ManualTriggerData
}
