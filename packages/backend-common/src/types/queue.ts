import type {
  enqueueExecutionPayloadSchema,
  manualTriggerDataSchema,
  webhookTriggerDataSchema,
} from './queue.schemas'
import type { z } from 'zod'

export type WebhookTriggerData = z.infer<typeof webhookTriggerDataSchema>
export type ManualTriggerData = z.infer<typeof manualTriggerDataSchema>
export type EnqueueExecutionPayload = z.infer<typeof enqueueExecutionPayloadSchema>
