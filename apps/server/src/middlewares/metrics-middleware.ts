import type { NextFunction, Request, Response } from 'express'
import { incMetric } from '@/utils/metrics'

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint()
  res.on('finish', () => {
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path
    const status = res.statusCode
    incMetric(`buzz8n_http_requests_total{method="${req.method}",route="${route}",status="${status}"}`)
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
    incMetric(`buzz8n_http_request_duration_ms_sum{method="${req.method}",route="${route}"}`, durationMs)
  })
  next()
}
