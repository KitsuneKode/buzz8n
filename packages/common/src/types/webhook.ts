import { Methods } from '@buzz8n/store'
import { z } from 'zod'

export const supportedMethodsSchema = z.enum(Methods)

export type SupportedMethods = z.infer<typeof supportedMethodsSchema>
