import { ALLOWED_ORIGINS, NODE_ENV } from './config'

// Parse allowed origins from environment variable
const parseAllowedOrigins = (): string[] | boolean => {
  if (!ALLOWED_ORIGINS) {
    // In development, allow all origins for easier development
    return NODE_ENV === 'development' ? true : []
  }

  // Split comma-separated origins and trim whitespace
  return ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const corsConfig = {
  origin: parseAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}
