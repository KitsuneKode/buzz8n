/**
 * Parse a JWT expiresIn-style duration into milliseconds.
 * Supports the common jsonwebtoken forms: bare seconds, or a number + unit
 * (s / m / h / d). Falls back to 7 days when the value is missing or invalid.
 */
export function jwtExpiresInToMs(expiresIn: string | undefined | null): number {
  const fallbackMs = 7 * 24 * 60 * 60 * 1000
  if (!expiresIn || typeof expiresIn !== 'string') return fallbackMs

  const trimmed = expiresIn.trim()
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000
  }

  const match = trimmed.match(/^(\d+)\s*([smhd])$/i)
  if (!match) return fallbackMs

  const amount = Number(match[1])
  const unit = match[2]!.toLowerCase()
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return amount * (multipliers[unit] ?? fallbackMs)
}
