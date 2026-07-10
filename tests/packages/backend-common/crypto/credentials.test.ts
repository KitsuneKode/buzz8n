import { beforeAll, describe, expect, test } from 'bun:test'
// Import the concrete module so earlier mock.module('@buzz8n/backend-common/crypto')
// stubs from other suites cannot shadow these exports.
import {
  decryptCredentialData,
  encryptCredentialData,
  resolveCredentialKeyBytes,
} from '../../../../packages/backend-common/src/crypto/credentials'

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

  test('resolveCredentialKeyBytes accepts hex, base64, and arbitrary secrets', () => {
    const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    expect(resolveCredentialKeyBytes(hex)).toHaveLength(32)

    const b64 = Buffer.alloc(32, 7).toString('base64')
    expect(resolveCredentialKeyBytes(b64)).toEqual(Uint8Array.from(Buffer.alloc(32, 7)))

    const hashed = resolveCredentialKeyBytes('dev-secret')
    expect(hashed).toHaveLength(32)
    expect(hashed).toEqual(resolveCredentialKeyBytes('dev-secret'))
  })

  test('hex keys produce stable encrypt/decrypt round-trips', async () => {
    process.env.CREDENTIALS_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

    const envelope = await encryptCredentialData({ apiKey: 'secret' })
    await expect(decryptCredentialData(envelope)).resolves.toEqual({ apiKey: 'secret' })

    process.env.CREDENTIALS_ENCRYPTION_KEY = 'test-key-for-unit-tests'
  })
})
