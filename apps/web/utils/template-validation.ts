/**
 * Validate template strings for matching braces and other issues.
 *
 * @param config - Configuration object to validate
 * @returns Array of error messages for invalid templates
 */

import Mustache from 'mustache'

export function validateTemplates(config: unknown): string[] {
  const errors: string[] = []

  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      // Only attempt parse if we see any mustache delimiters
      if (value.includes('{{') || value.includes('}}')) {
        try {
          Mustache.parse(value)
        } catch (e) {
          errors.push(
            `Invalid template at ${path || '<root>'}: ${(e as Error)?.message ?? String(e)}`,
          )
        }
      }
      return
    }
    if (Array.isArray(value)) {
      value.forEach((v, i) => visit(v, `${path}[${i}]`))
      return
    }
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        visit(v, path ? `${path}.${k}` : k)
      }
    }
  }

  visit(config, '')
  return errors
}

// export function validateTemplates(config: Record<string, any>): string[] {
//   const errors: string[] = []
//
//   for (const [key, value] of Object.entries(config)) {
//     if (typeof value === 'string' && value.includes('{{')) {
//       const open = (value.match(/{{/g) || []).length
//       const close = (value.match(/}}/g) || []).length
//       if (open !== close) {
//         errors.push(`Unclosed template in ${key}: ${value}`)
//       }
//     }
//   }
//
//   return errors
// }
