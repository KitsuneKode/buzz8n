import express from 'express'

import { errorHandlerMiddleware } from '@/middlewares/error-handler-middleware'
import { timingMiddleware } from '@/middlewares/timing-middleware'
import { backendConfig } from '@buzz8n/backend-common/config'
import { credentialRouter } from '@/routers/credential'
import { executionRouter } from '@/routers/executions'
import { workflowRouter } from '@/routers/workflow'
import { webhookRouter } from '@/routers/webhook'
import { corsConfig } from '@/utils/cors-config'
import { authRouter } from '@/routers/auth'
import cookieParser from 'cookie-parser'
import { logger } from '@/utils/logger'
import { PORT } from '@/utils/config'
import cors from 'cors'

backendConfig.validateAll()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsConfig))
app.use(timingMiddleware)

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

const routers = [authRouter, credentialRouter, workflowRouter, executionRouter]

routers.forEach((router) => app.use('/api/v1', router))

app.use(webhookRouter)
app.use('{/*splat}', timingMiddleware, (req, res) => {
  logger.info(`[404] ${req.originalUrl} ${req.method}  was called`)
  res.status(404).send('Page not Found')
})

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  logger.info(`Server started at PORT: ${PORT} `)
})
