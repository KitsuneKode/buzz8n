import { z } from 'zod'

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

export function apiError(error: string, options?: { code?: string; details?: unknown }): ApiError {
  return {
    error,
    ...(options?.code ? { code: options.code } : {}),
    ...(options?.details !== undefined ? { details: options.details } : {}),
  }
}
