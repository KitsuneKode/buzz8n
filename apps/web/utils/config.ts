import { ConfigLoader } from '@buzz8n/common/utils/config-loader'

const clientConfigSchema = {
  apiUrl: () => process.env.NEXT_PUBLIC_API_URL,
  environment: () => process.env.NODE_ENV,
}

export const config = ConfigLoader.getInstance(clientConfigSchema, 'client')

export const API_URL = config.getConfig('apiUrl')
