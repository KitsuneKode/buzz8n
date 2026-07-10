import express from 'express'

import { errorHandlerMiddleware } from '@/middlewares/error-handler-middleware'
import { rateLimitMiddleware } from './middlewares/rate-limiter-middleware'
import { metricsMiddleware } from '@/middlewares/metrics-middleware'
import { requestIdMiddleware } from '@/middlewares/request-id-middleware'
import { rateLimitStatusRouter } from '@/routers/rate-limit-status'
import { backendConfig } from '@buzz8n/backend-common/config'
import { openApiDocsHtml, openApiSpec } from '@/openapi'
import { credentialRouter } from '@/routers/credential'
import { executionRouter } from '@/routers/executions'
import { workflowRouter } from '@/routers/workflow'
import { webhookRouter } from '@/routers/webhook'
import { getMetricsText } from '@/utils/metrics'
import { corsConfig } from '@/utils/cors-config'
import { authRouter } from '@/routers/auth'
import cookieParser from 'cookie-parser'
import { logger } from '@/utils/logger'
import { prisma } from '@buzz8n/store'
import { PORT } from '@/utils/config'
import { redis } from '@/redis'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'

backendConfig.validateAll()

const app = express()

app.use(requestIdMiddleware)
app.use(metricsMiddleware)
app.use(express.json())
app.use(cookieParser())

// Security and logging middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://unpkg.com', "'unsafe-inline'"],
        styleSrc: ["'self'", 'https://unpkg.com', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://unpkg.com'],
        connectSrc: ["'self'"],
      },
    },
  }),
)
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
  res.status(200).json({ status: 'ok' })
})

app.get('/health/live', rateLimitMiddleware.api, (_, res) => {
  res.status(200).json({ status: 'live' })
})

app.get('/metrics', rateLimitMiddleware.api, (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  res.status(200).send(getMetricsText())
})

app.get('/health/ready', rateLimitMiddleware.api, async (_req, res) => {
  const checks: Record<string, 'ok' | 'error'> = {
    database: 'error',
    redis: 'error',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (error) {
    logger.error('Readiness check: database failed', { error })
  }

  try {
    if (!redis.isOpen) {
      await redis.connect()
    }
    await redis.ping()
    checks.redis = 'ok'
  } catch (error) {
    logger.error('Readiness check: redis failed', { error })
  }

  const ready = checks.database === 'ok' && checks.redis === 'ok'
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    checks,
  })
})

app.get('/api/v1/openapi.json', (_req, res) => {
  res.status(200).json(openApiSpec)
})

app.get('/api/v1/docs', (_req, res) => {
  res.status(200).type('html').send(openApiDocsHtml)
})

const routers = [
  authRouter,
  credentialRouter,
  workflowRouter,
  executionRouter,
  rateLimitStatusRouter,
]

routers.forEach((router) => app.use('/api/v1', router))

app.use(webhookRouter)
app.use(rateLimitMiddleware.api)
app.use('{/*splat}', (req, res) => {
  logger.info(`[404] ${req.originalUrl} ${req.method}  was called`)
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' })
})

app.use(errorHandlerMiddleware)

async function start() {
  try {
    await redis.connect()
  } catch (error) {
    logger.warn('Redis connect at startup failed; readiness will report until available', {
      error,
    })
  }

  app.listen(PORT, () => {
    logger.info(`Server started at PORT: ${PORT} `)
  })
}

start()
