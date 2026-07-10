import { decryptCredentialData, isCredentialEnvelope } from '@buzz8n/backend-common/crypto'
import { prisma } from '@buzz8n/store/'

export async function loadCredentialData(
  credentialId: string,
  userId: string,
): Promise<Record<string, unknown>> {
  const credential = await prisma.credential.findFirst({
    where: { id: credentialId, userId, archived: false },
  })
  if (!credential?.data) {
    throw new Error('Credential not found')
  }

  const raw = credential.data
  if (isCredentialEnvelope(raw)) {
    return await decryptCredentialData(raw)
  }

  // Temporary plaintext fallback during migration.
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }

  throw new Error('Invalid credential data')
}
