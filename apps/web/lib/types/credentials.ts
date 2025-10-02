import { SupportedPlatforms } from '@buzz8n/common/types'
import z from 'zod'

export type Provider = z.infer<typeof SupportedPlatforms>
// export type Provider = 'telegram' | 'slack' | 'discord' | 'twilio' | 'gmail' | 'webhook'

export interface CredentialData {
  provider: Provider
  name: string
  config: Record<string, string | boolean | number>
}

export const telegramFormSchema = z.object({
  name: z.string().trim().min(1, 'Credential name is required'),
  botToken: z
    .string()
    .trim()
    .min(1, 'Bot token is required')
    .regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid bot token format'),
  chatId: z
    .string()
    .trim()
    .min(1, 'Chat ID is required')
    .regex(/^-?\d+$/, 'Chat ID must be a number'),
  sendTestMessage: z.boolean(),
})

export type TelegramFormData = z.infer<typeof telegramFormSchema>

export type Credential = {
  id: string
  name: string
  provider: Provider
  createdAt: Date
  config: Record<string, string | boolean | number>
}
