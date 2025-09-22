import type { NextFunction, Request, Response } from 'express'
import { logger } from '@/utils/logger'

export const errorHandlerMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
    time: Date.now(),
  }

  logger.error(`Error on Route : ${errorDetails.route}`, err, errorHandlerMiddleware)

  // Send a generic, user-friendly error response to the client
  res.status(500).send('Internal Server Error')
}
