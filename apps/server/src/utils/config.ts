import { backendConfig as config } from '@buzz8n/common/config'

export { config }
export const JWT_SECRET = config.getConfig('jwtSecret')
export const DATABASE_URL = config.getConfig('dbUrl')
export const PORT = config.getConfig('port')
export const NODE_ENV = config.getConfig('environment')

export const ALLOWED_ORIGINS = config.getConfig('allowedOrigins')
