import type { AxiosError } from 'axios'

/**
 * Extract a user-facing message from an Axios error whose response body may be
 * either a plain string (legacy) or `{ error | message: string }` JSON.
 */
export function getApiErrorMessage(error: AxiosError, fallback: string): string {
  const data = error.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.error === 'string') return record.error
    if (typeof record.message === 'string') return record.message
  }
  return fallback
}
