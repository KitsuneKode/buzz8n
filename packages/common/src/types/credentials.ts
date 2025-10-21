import { Platforms } from '@buzz8n/store'
import z from 'zod'

// Map the database enum to our supported platforms
export const SupportedPlatforms = z.enum(Platforms)

export const credentialSchema = z.object({
  title: z.string(),
  platform: SupportedPlatforms,
  data: z.record(z.string(), z.any()), // <-- returns Record<string, any>
})

export const credentialResponse = z.object({
  id: z.string(),
  title: z.string(),
  platform: SupportedPlatforms,
  data: z.object(),
  createdAt: z.date(),
})

export type CredentialResponse = z.infer<typeof credentialResponse>

export const telegramFormSchema = z.object({
  name: z.string().trim().min(1, 'Credential name is required'),
  botToken: z
    .string()
    .trim()
    .min(1, 'Bot token is required')
    .regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid bot token format'),
})

export const emailFormSchema = z.object({
  name: z.string().trim().min(1, 'Credential name is required'),
  resendApiKey: z.string().trim().min(1, 'Resend API key is required'),
})

export const geminiFormSchema = z.object({
  platform: z.literal('gemini'),
  name: z.string().trim().min(1, 'Credential name is required'),
  geminiApiKey: z.string().trim().min(1, 'Gemini API key is required'),
})

export const anthropicFormSchema = z.object({
  platform: z.literal('anthropic'),
  name: z.string().trim().min(1, 'Credential name is required'),
  anthropicApiKey: z.string().trim().min(1, 'Anthropic API key is required'),
})

export const openaiFormSchema = z.object({
  platform: z.literal('openai'),
  name: z.string().trim().min(1, 'Credential name is required'),
  openaiApiKey: z.string().trim().min(1, 'OpenAI API key is required'),
})
export type TelegramFormData = z.infer<typeof telegramFormSchema>
export type EmailFormData = z.infer<typeof emailFormSchema>
export type GeminiFormData = z.infer<typeof geminiFormSchema>
export type AnthropicFormData = z.infer<typeof anthropicFormSchema>
export type OpenAIFormData = z.infer<typeof openaiFormSchema>

export const aiAgentFormSchema = z.discriminatedUnion('platform', [
  geminiFormSchema,
  anthropicFormSchema,
  openaiFormSchema,
])
export type AiAgentFormData = z.infer<typeof aiAgentFormSchema>
