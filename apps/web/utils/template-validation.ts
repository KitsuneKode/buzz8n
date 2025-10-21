/**
 * Validate template strings for matching braces and other issues.
 *
 * @param config - Configuration object to validate
 * @returns Array of error messages for invalid templates
 */
export function validateTemplates(config: Record<string, any>): string[] {
  const errors: string[] = []

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.includes('{{')) {
      const open = (value.match(/{{/g) || []).length
      const close = (value.match(/}}/g) || []).length
      if (open !== close) {
        errors.push(`Unclosed template in ${key}: ${value}`)
      }
    }
  }

  return errors
}
