export type CredentialEnvelope = {
  v: 1
  alg: 'AES-GCM'
  iv: string
  ciphertext: string
}

/**
 * Resolve CREDENTIALS_ENCRYPTION_KEY to 32 raw bytes.
 *
 * Accepted forms (in order):
 * 1. 64-char hex (32 bytes) — preferred for production
 * 2. base64 that decodes to exactly 32 bytes
 * 3. any other string — SHA-256 hashed to 32 bytes (dev-friendly)
 *
 * This keeps Bun Web Crypto as the sole implementation while remaining
 * compatible with keys provisioned for the older node:crypto helper.
 */
export function resolveCredentialKeyBytes(secret: string): Uint8Array {
  const trimmed = secret.trim()

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Uint8Array.from(Buffer.from(trimmed, 'hex'))
  }

  try {
    const fromB64 = Buffer.from(trimmed, 'base64')
    if (fromB64.length === 32) {
      return new Uint8Array(fromB64)
    }
  } catch {
    // fall through to hash
  }

  const keyBytes = new Uint8Array(32)
  Bun.CryptoHasher.hash('sha256', trimmed, keyBytes)
  return keyBytes
}

function getKeyBytes(): Uint8Array {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY

  if (!secret) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is required')
  }

  return resolveCredentialKeyBytes(secret)
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', getKeyBytes(), 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptCredentialData(
  data: Record<string, unknown>,
): Promise<CredentialEnvelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await importKey()
  const encoded = new TextEncoder().encode(JSON.stringify(data))
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)

  return {
    v: 1,
    alg: 'AES-GCM',
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: Buffer.from(cipherBuf).toString('base64'),
  }
}

export async function decryptCredentialData(
  envelope: CredentialEnvelope,
): Promise<Record<string, unknown>> {
  if (envelope.v !== 1 || envelope.alg !== 'AES-GCM') {
    throw new Error('Unsupported credential envelope')
  }

  const key = await importKey()
  const iv = Buffer.from(envelope.iv, 'base64')
  const ciphertext = Buffer.from(envelope.ciphertext, 'base64')
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)

  return JSON.parse(new TextDecoder().decode(plainBuf)) as Record<string, unknown>
}

export function isCredentialEnvelope(value: unknown): value is CredentialEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as CredentialEnvelope).v === 1 &&
    (value as CredentialEnvelope).alg === 'AES-GCM' &&
    typeof (value as CredentialEnvelope).iv === 'string' &&
    typeof (value as CredentialEnvelope).ciphertext === 'string'
  )
}
