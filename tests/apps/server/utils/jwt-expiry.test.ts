import { describe, test, expect } from 'bun:test'
import { jwtExpiresInToMs } from '../../../../apps/server/src/utils/jwt-expiry'

describe('jwtExpiresInToMs', () => {
  test('parses day/hour/minute/second units', () => {
    expect(jwtExpiresInToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000)
    expect(jwtExpiresInToMs('1h')).toBe(60 * 60 * 1000)
    expect(jwtExpiresInToMs('30m')).toBe(30 * 60 * 1000)
    expect(jwtExpiresInToMs('45s')).toBe(45 * 1000)
  })

  test('treats bare numbers as seconds', () => {
    expect(jwtExpiresInToMs('3600')).toBe(3600 * 1000)
  })

  test('falls back to 7 days for missing or invalid values', () => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    expect(jwtExpiresInToMs(undefined)).toBe(sevenDays)
    expect(jwtExpiresInToMs(null)).toBe(sevenDays)
    expect(jwtExpiresInToMs('')).toBe(sevenDays)
    expect(jwtExpiresInToMs('not-a-duration')).toBe(sevenDays)
  })
})
