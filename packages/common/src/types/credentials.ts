import z from 'zod'

export const SupportedPlatforms = z.enum(['Telegram', 'Gmail'])

export const credentialSchema = z.object({
  title: z.string(),
  platform: SupportedPlatforms,
  data: z.object(),
})
