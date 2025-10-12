import { clientConfig as config } from '@buzz8n/common/utils/config-loader'

config.validateAll()

export { config }
export const API_URL = config.getConfig('apiBaseUrl')
