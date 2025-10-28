import type { ExecContext } from '.'
import Mustache from 'mustache'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTemplate(value: unknown, context: ExecContext): any {
  if (typeof value !== 'string') return value
  if (!value.includes('{{')) return value
  return Mustache.render(value, context)
}
