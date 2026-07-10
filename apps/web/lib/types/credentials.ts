export type Provider =
  | 'Telegram'
  | 'Email'
  | 'OpenAI'
  | 'Gemini'
  | 'Anthropic'
  | 'Discord'
  | 'Slack'
  | 'Gmail'

/** Credential metadata shown in the UI. Secrets are never returned by the list API. */
export type Credential = {
  id: string
  name: string
  provider: Provider
  createdAt: Date
  /** Present only when explicitly loaded; list endpoints omit secrets. */
  config?: Record<string, string | boolean | number>
}

export type CredentialData = {
  provider: Provider
  name: string
  config: Record<string, string | boolean | number>
}

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
