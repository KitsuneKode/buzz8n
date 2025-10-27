import { wsServerConfig as config } from '@buzz8n/backend-common/config'
export { wsServerLogger as logger } from '@buzz8n/backend-common/logger'

export { config }
export const JWT_SECRET = config.getConfig('jwtSecret')
export const PORT = config.getConfig('port')
