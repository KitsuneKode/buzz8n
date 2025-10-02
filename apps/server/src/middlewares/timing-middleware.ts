import type { NextFunction, Request, Response } from 'express'
import { NODE_ENV } from '@/utils/config'
import { logger } from '@/utils/logger'

export const timingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  if (NODE_ENV === 'development') {
    //artificial delay
    const waitMs = Math.floor(Math.random() * 50) + 10
    setTimeout(() => next(), waitMs)
  } else {
    next()
  }

  res.on('finish', () => {
    const endTime = Date.now()
    logger.info(`[TIMING] ${req.path} ${req.method} took ${endTime - startTime}ms to execute`)
  })
}
