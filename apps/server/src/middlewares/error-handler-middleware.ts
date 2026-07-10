import type { ErrorRequestHandler } from 'express'
import { logger } from '@/utils/logger'

export const errorHandlerMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error(`Error on Route : ${req.originalUrl}`, {
    message: error.message,
    stack: error.stack,
  })
  if (res.headersSent) return
  res.status(500).json({ error: 'Internal Server Error' })
}
