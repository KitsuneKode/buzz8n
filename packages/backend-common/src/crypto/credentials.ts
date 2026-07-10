export type CredentialEnvelope = {
  v: 1
  alg: 'AES-GCM'
  iv: string
  ciphertext: string
}

function getKeyBytes(): Uint8Array {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY

  if (!secret) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is required')
  }

  const keyBytes = new Uint8Array(32)
  Bun.CryptoHasher.hash('sha256', secret, keyBytes)
  return keyBytes
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
