import { SupportedPlatforms } from '@buzz8n/common/types'
export { type TelegramFormData, telegramFormSchema } from '@buzz8n/common/types'
import z from 'zod'

export type Provider = z.infer<typeof SupportedPlatforms>
// export type Provider = 'telegram' | 'slack' | 'discord' | 'twilio' | 'gmail' | 'webhook'

export interface CredentialData {
  provider: Provider
  name: string
  config: Record<string, string | boolean | number>
}

export type Credential = {
  id: string
  name: string
  provider: Provider
  createdAt: Date
  config: Record<string, string | boolean | number>
}
