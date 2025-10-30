import { clientConfig as config } from '@buzz8n/common/utils/config-loader'

config.validateAll()

export const API_URL = config.getConfig('apiBaseUrl')
export const BASE_APP_URL = config.getConfig('appUrl')
export const NODE_ENV = config.getConfig('nodeEnv')
export const WS_URL = config.getConfig('wsUrl')
export const WEBHOOK_URL = config.getConfig('webhookUrl')

export { config }
