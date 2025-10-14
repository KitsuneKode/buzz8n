import z from 'zod'

export const SupportedPlatforms = z.enum([
  'Telegram',
  'Gmail',
  'Slack',
  'Discord',
  'Twilio',
  'Webhook',
])

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
  chatId: z
    .string()
    .trim()
    .min(1, 'Chat ID is required')
    .regex(/^-?\d+$/, 'Chat ID must be a number'),
  sendTestMessage: z.boolean(),
})

export type TelegramFormData = z.infer<typeof telegramFormSchema>
