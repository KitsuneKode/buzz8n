import type { NextFunction, Request, Response } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '@/utils/config'

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authCookie = req.cookies['buzz8n_auth']

    console.log('auth hit', authCookie)
    const isVerified = jwt.verify(authCookie, JWT_SECRET!)
    if (!isVerified) {
      res.clearCookie('buzz8n_auth').status(401).send('Not authenticated')
      return
    }

    const email = (isVerified as JwtPayload).email

    req.user = { email }
    next()
  } catch (error) {
    console.log('error')
    next(error)
  }
}
