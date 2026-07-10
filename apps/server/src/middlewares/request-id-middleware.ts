import type { NextFunction, Request, Response } from 'express'

const REQUEST_ID_HEADER = 'x-request-id'

function generateRequestId(): string {
  return crypto.randomUUID()
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.headers[REQUEST_ID_HEADER]
  const requestId =
    typeof incoming === 'string' && incoming.trim().length > 0
      ? incoming.trim()
      : generateRequestId()

  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)
  next()
}
