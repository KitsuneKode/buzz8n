import express from 'express'

import { errorHandlerMiddleware } from '@/middlewares/error-handler-middleware'
import { rateLimitMiddleware } from './middlewares/rate-limiter-middleware'
import { rateLimitStatusRouter } from '@/routers/rate-limit-status'
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
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'

backendConfig.validateAll()

const app = express()

app.use(express.json())
app.use(cookieParser())

// Security and logging middleware
app.use(helmet())
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
)

app.use(cors(corsConfig))
// app.use(timingMiddleware)

app.get('/health', rateLimitMiddleware.api, (_, res) => {
  res.status(200).send('OK')
})

const routers = [
  authRouter,
  credentialRouter,
  workflowRouter,
  executionRouter,
  rateLimitStatusRouter,
]

routers.forEach((router) => app.use('/api/v1', rateLimitMiddleware.api, router))
app.use(webhookRouter)

app.use((req, res) => {
  logger.info(`[404] ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: 'Not Found' })
})

app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
  logger.info(`Server started at PORT: ${PORT} `)
})
