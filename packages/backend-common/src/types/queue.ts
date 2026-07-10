export interface EnqueueExecutionPayload {
  executionId: string
  workflowId: string
  data: unknown
  /** Retry count (Redis stream field; may arrive as string) */
  attempts?: string | number
}
