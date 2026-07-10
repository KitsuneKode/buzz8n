import { decryptCredentialData, isCredentialEnvelope } from '@buzz8n/backend-common/crypto'
import { prisma } from '@buzz8n/store/'
import { logger } from '@/utils'

function allowPlaintextCredentials(): boolean {
  return process.env.ALLOW_PLAINTEXT_CREDENTIALS === 'true'
}

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

  // Temporary plaintext fallback during migration — opt-in only.
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    if (!allowPlaintextCredentials()) {
      throw new Error(
        'Credential is stored in plaintext. Run the encrypt-credentials migration or set ALLOW_PLAINTEXT_CREDENTIALS=true temporarily.',
      )
    }

    logger.warn('Loading plaintext credential; migrate with encrypt-credentials script', {
      credentialId,
      userId,
    })
    return raw as Record<string, unknown>
  }

  throw new Error('Invalid credential data')
}
