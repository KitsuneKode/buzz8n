import type { NextFunction, Request, Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '@/utils/config'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authCookie = req.cookies['buzz8n_auth']

    const isVerified = jwt.verify(authCookie, JWT_SECRET!)
    const { email, userId } = isVerified as JwtPayload

    if (!isVerified || !email || !userId) {
      res.clearCookie('buzz8n_auth').status(401).send('Not authenticated')
      return
    }

    req.user = { email, userId }

    next()
  } catch (error) {
    console.log('error')
    next(error)
  }
}
