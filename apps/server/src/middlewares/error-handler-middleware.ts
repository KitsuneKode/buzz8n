import type { NextFunction, Request, Response } from 'express'
import { apiError } from '@buzz8n/common/types'
import { logger } from '@/utils/logger'

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express error middleware signature
  _next: NextFunction,
) => {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    route: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
    time: Date.now(),
  }

  logger.error(`Error on Route : ${errorDetails.route}`, {
    error,
    requestId: req.requestId,
    route: errorDetails.route,
    method: errorDetails.method,
  })

  if (res.headersSent) {
    return
  }

  res.status(500).json(apiError('Internal server error', { code: 'INTERNAL_ERROR' }))
}
