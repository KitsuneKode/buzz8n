import type { NextFunction, Request, Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '@/utils/config'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authCookie = req.cookies['buzz8n_auth']

    if (!authCookie) {
      res.status(401).send('Access token required')
      return
    }

    const isVerified = jwt.verify(authCookie, JWT_SECRET!)
    const { email, userId } = isVerified as JwtPayload

    if (!isVerified || !email || !userId) {
      res.status(401).send('Not authenticated')
      return
    }

    req.user = { email, userId }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    } else {
      next(error)
    }
  }
}
