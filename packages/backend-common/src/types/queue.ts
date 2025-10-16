export interface EnqueueExecutionPayload {
  executionId: string
  workflowId: string
  payload: unknown
}
