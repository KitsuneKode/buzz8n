import express from 'express'

import { errorHandlerMiddleware } from '@/middlewares/error-handler-middleware'
import { timingMiddleware } from '@/middlewares/timing-middleware'
import { config, PORT } from '@/utils/config'
import { authRouter } from '@/routers/auth'
import { logger } from '@/utils/logger'

config.validate(['environment', 'port', 'jwtSecret'])

const app = express()

app.use(express.json())
app.use(timingMiddleware)

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK')
})

const routers = [authRouter]

routers.forEach((router) => app.use('/api/v1', router))

app.use('{/*splat}', (req, res) => {
  res.status(404).send('Page not Found')
})

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  logger.info(`Server started at PORT: ${PORT} `)
})
