import { beforeAll, describe, expect, test } from 'bun:test'
import {
  decryptCredentialData,
  encryptCredentialData,
} from '@buzz8n/backend-common/crypto'

describe('credential crypto', () => {
  beforeAll(() => {
    process.env.CREDENTIALS_ENCRYPTION_KEY = 'test-key-for-unit-tests'
  })

  test('round-trips a telegram bot token payload', async () => {
    const plain = { botToken: '123:ABC' }
    const envelope = await encryptCredentialData(plain)

    expect(envelope.v).toBe(1)
    expect(envelope.alg).toBe('AES-GCM')
    expect(envelope.ciphertext).not.toContain('ABC')

    const out = await decryptCredentialData(envelope)

    expect(out).toEqual(plain)
  })

  test('rejects tampered ciphertext', async () => {
    const envelope = await encryptCredentialData({ botToken: 'x' })
    envelope.ciphertext = `${envelope.ciphertext.slice(0, -4)}xxxx`

    await expect(decryptCredentialData(envelope)).rejects.toThrow()
  })
})
