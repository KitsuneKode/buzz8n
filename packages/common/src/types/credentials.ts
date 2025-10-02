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
  data: z.record(z.string(), z.any()) // <-- returns Record<string, any>
  
})

export const credentialResponse = z.object({
  id: z.string(),
  title: z.string(),
  platform: SupportedPlatforms,
  data: z.object(),
  createdAt: z.date(),
})

export type CredentialResponse = z.infer<typeof credentialResponse>
