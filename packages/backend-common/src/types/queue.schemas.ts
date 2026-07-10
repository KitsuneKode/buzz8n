import { z } from 'zod'

export const webhookTriggerDataSchema = z.object({
  triggerType: z.literal('webhook'),
  method: z.string(),
  path: z.string(),
  headers: z.record(z.string(), z.string()),
  query: z.record(z.string(), z.string()),
  body: z.unknown(),
})

export const manualTriggerDataSchema = z.object({
  triggerType: z.literal('manualTrigger'),
  body: z.unknown().optional(),
})

export const triggerDataSchema = z.discriminatedUnion('triggerType', [
  webhookTriggerDataSchema,
  manualTriggerDataSchema,
])

export const enqueueExecutionPayloadSchema = z.object({
  executionId: z.string().min(1),
  workflowId: z.string().min(1),
  data: triggerDataSchema,
})

const parsedTriggerDataSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}, triggerDataSchema)

export const enqueueExecutionWirePayloadSchema = z.object({
  executionId: z.string().min(1),
  workflowId: z.string().min(1),
  data: parsedTriggerDataSchema,
})

export type ParseEnqueueExecutionPayloadResult = z.ZodSafeParseResult<
  z.infer<typeof enqueueExecutionPayloadSchema>
>

function parseJsonString(value: string): unknown {
  return JSON.parse(value) as unknown
}

/**
 * Parse and validate a queue message from Redis.
 * Handles wire format where `data` may be a JSON string (see enqueue.ts).
 */
export function parseEnqueueExecutionPayload(raw: unknown): ParseEnqueueExecutionPayloadResult {
  let message: unknown = raw

  if (typeof raw === 'string') {
    try {
      message = parseJsonString(raw)
    } catch {
      return enqueueExecutionWirePayloadSchema.safeParse(undefined)
    }
  }

  return enqueueExecutionWirePayloadSchema.safeParse(message)
}
