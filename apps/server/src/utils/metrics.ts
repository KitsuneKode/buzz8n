/**
 * Lightweight in-process metrics for the API server.
 * Phase 2 baseline — Prometheus-compatible text exposition without extra deps.
 */
const counters = new Map<string, number>()

export function incMetric(name: string, by = 1): void {
  counters.set(name, (counters.get(name) ?? 0) + by)
}

export function getMetricsText(): string {
  const lines: string[] = [
    '# HELP buzz8n_http_requests_total Total HTTP requests observed by middleware',
    '# TYPE buzz8n_http_requests_total counter',
  ]
  for (const [name, value] of counters.entries()) {
    lines.push(`${name} ${value}`)
  }
  lines.push(`buzz8n_process_uptime_seconds ${process.uptime()}`)
  return `${lines.join('\n')}\n`
}
