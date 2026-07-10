import { beforeEach, describe, expect, mock, test } from 'bun:test'

const findFirst = mock(async (): Promise<{ data: unknown } | null> => null)
const warn = mock(() => {})

mock.module('@buzz8n/store/', () => ({
  prisma: {
    credential: {
      findFirst,
    },
  },
}))

mock.module('@buzz8n/backend-common/crypto', () => ({
  isCredentialEnvelope: (value: unknown) =>
    typeof value === 'object' &&
    value !== null &&
    (value as { v?: number }).v === 1 &&
    (value as { alg?: string }).alg === 'AES-GCM',
  decryptCredentialData: async () => ({ botToken: 'decrypted' }),
}))

mock.module('@/utils', () => ({
  logger: {
    warn,
    info: mock(() => {}),
    error: mock(() => {}),
    debug: mock(() => {}),
  },
}))

const { loadCredentialData } = await import('../../../../apps/worker/src/nodes/load-credential')

describe('loadCredentialData', () => {
  beforeEach(() => {
    findFirst.mockClear()
    warn.mockClear()
    delete process.env.ALLOW_PLAINTEXT_CREDENTIALS
  })

  test('decrypts credential envelopes', async () => {
    findFirst.mockResolvedValueOnce({
      data: {
        v: 1,
        alg: 'AES-GCM',
        iv: 'iv',
        ciphertext: 'cipher',
      },
    })

    await expect(loadCredentialData('cred-1', 'user-1')).resolves.toEqual({
      botToken: 'decrypted',
    })
  })

  test('rejects plaintext credentials by default', async () => {
    findFirst.mockResolvedValueOnce({
      data: { botToken: 'plain-token' },
    })

    await expect(loadCredentialData('cred-1', 'user-1')).rejects.toThrow(/plaintext/i)
    expect(warn).not.toHaveBeenCalled()
  })

  test('allows plaintext credentials when ALLOW_PLAINTEXT_CREDENTIALS=true', async () => {
    process.env.ALLOW_PLAINTEXT_CREDENTIALS = 'true'
    findFirst.mockResolvedValueOnce({
      data: { botToken: 'plain-token' },
    })

    await expect(loadCredentialData('cred-1', 'user-1')).resolves.toEqual({
      botToken: 'plain-token',
    })
    expect(warn).toHaveBeenCalled()
  })
})
