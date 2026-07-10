import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const VERSION = 1
const ENC_MARKER = '__enc' as const

export type EncryptedCredentialPayload = {
  [ENC_MARKER]: true
  v: number
  iv: string
  tag: string
  ciphertext: string
}

function resolveKey(rawKey: string): Buffer {
  const trimmed = rawKey.trim()
  // Prefer 64-char hex (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex')
  }
  // Or standard base64 encoding of 32 bytes
  try {
    const fromB64 = Buffer.from(trimmed, 'base64')
    if (fromB64.length === 32) {
      return fromB64
    }
  } catch {
    // fall through
  }
  throw new Error(
    'CREDENTIALS_ENCRYPTION_KEY must be a 64-char hex string or base64-encoded 32-byte key',
  )
}

export function isEncryptedCredentialPayload(value: unknown): value is EncryptedCredentialPayload {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    record[ENC_MARKER] === true &&
    typeof record.iv === 'string' &&
    typeof record.tag === 'string' &&
    typeof record.ciphertext === 'string'
  )
}

/**
 * Encrypt credential JSON for at-rest storage (AES-256-GCM).
 */
export function encryptCredentialData(
  data: Record<string, unknown>,
  encryptionKey: string,
): EncryptedCredentialPayload {
  const key = resolveKey(encryptionKey)
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const plaintext = Buffer.from(JSON.stringify(data), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    [ENC_MARKER]: true,
    v: VERSION,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  }
}

/**
 * Decrypt credential JSON. Legacy plaintext objects are returned as-is.
 */
export function decryptCredentialData(
  stored: unknown,
  encryptionKey: string,
): Record<string, unknown> {
  if (!isEncryptedCredentialPayload(stored)) {
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      return stored as Record<string, unknown>
    }
    throw new Error('Invalid credential data format')
  }

  if (stored.v !== VERSION) {
    throw new Error(`Unsupported credential encryption version: ${stored.v}`)
  }

  const key = resolveKey(encryptionKey)
  const iv = Buffer.from(stored.iv, 'base64')
  const tag = Buffer.from(stored.tag, 'base64')
  const ciphertext = Buffer.from(stored.ciphertext, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  const parsed: unknown = JSON.parse(plaintext.toString('utf8'))

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Decrypted credential data is not an object')
  }

  return parsed as Record<string, unknown>
}
