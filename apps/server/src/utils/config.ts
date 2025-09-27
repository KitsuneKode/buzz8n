import { ConfigLoader } from '@buzz8n/common/config'

const backendConfigSchema = {
  environment: () => process.env.NODE_ENV,
  dbUrl: () => process.env.DATABASE_URL,
  port: () => process.env.PORT,
  jwtSecret: () => process.env.JWT_SECRET,
  allowedOrigins: () => process.env.ALLOWED_ORIGINS,
}

export const config = ConfigLoader.getInstance(backendConfigSchema, 'server')

export const JWT_SECRET = config.getConfig('jwtSecret')
export const DATABASE_URL = config.getConfig('dbUrl')
export const PORT = config.getConfig('port')
export const NODE_ENV = config.getConfig('environment')

export const ALLOWED_ORIGINS = config.getConfig('allowedOrigins')
