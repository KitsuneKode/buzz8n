import { z } from 'zod'

export const supportedMethodsSchema = z.enum(['POST', 'GET', 'PUT'])

export type SupportedMethods = z.infer<typeof supportedMethodsSchema>
