import { randomBytes } from 'node:crypto'
import { describe, expect, test } from 'bun:test'
import {
  decryptCredentialData,
  encryptCredentialData,
  isEncryptedCredentialPayload,
} from '../../../packages/backend-common/src/utils/credentials-crypto.ts'

// Ephemeral per-run key — never commit a fixed hex secret (GitGuardian / secretlint).
const KEY = randomBytes(32).toString('hex')

describe('credentials-crypto', () => {
  test('encrypts and decrypts credential payloads', () => {
    const original = { botToken: '123:ABC', name: 'Telegram' }
    const encrypted = encryptCredentialData(original, KEY)

    expect(isEncryptedCredentialPayload(encrypted)).toBe(true)
    expect(encrypted.ciphertext).not.toContain('ABC')

    const decrypted = decryptCredentialData(encrypted, KEY)
    expect(decrypted).toEqual(original)
  })

  test('passes through legacy plaintext objects', () => {
    const legacy = { resendApiKey: 're_123', email: 'a@b.com', name: 'Email' }
    const decrypted = decryptCredentialData(legacy, KEY)
    expect(decrypted).toEqual(legacy)
  })

  test('rejects invalid encryption keys', () => {
    expect(() => encryptCredentialData({ a: 1 }, 'too-short')).toThrow()
  })
})
