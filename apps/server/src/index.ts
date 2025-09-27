import express from 'express'

import { errorHandlerMiddleware } from '@/middlewares/error-handler-middleware'
import { timingMiddleware } from '@/middlewares/timing-middleware'
import { credentialRouter } from '@/routers/credential'
import { corsConfig } from '@/utils/cors-config'
import { config, PORT } from '@/utils/config'
import { authRouter } from '@/routers/auth'
import cookieParser from 'cookie-parser'
import { logger } from '@/utils/logger'
import cors from 'cors'

config.validate(['environment', 'port', 'jwtSecret'])

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsConfig))
app.use(timingMiddleware)

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK')
})

const routers = [authRouter, credentialRouter]

routers.forEach((router) => app.use('/api/v1', router))

app.use('{/*splat}', timingMiddleware, (req, res) => {
  res.status(404).send('Page not Found')
})

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  logger.info(`Server started at PORT: ${PORT} `)
})
