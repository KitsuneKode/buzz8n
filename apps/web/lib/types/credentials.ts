import { SupportedPlatforms } from '@buzz8n/common/types'
export {
  type TelegramFormData,
  telegramFormSchema,
  type EmailFormData,
  emailFormSchema,
  type OpenAIFormData,
  openaiFormSchema,
  type GeminiFormData,
  geminiFormSchema,
  type AnthropicFormData,
  anthropicFormSchema,
} from '@buzz8n/common/types'
import z from 'zod'

export type Provider = z.infer<typeof SupportedPlatforms> | 'Discord' | 'Slack' | 'Gmail'

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
