import { decryptCredentialData } from '@buzz8n/backend-common/credentials-crypto'
import { CREDENTIALS_ENCRYPTION_KEY } from '@/utils'
import { prisma } from '@buzz8n/store/'

/**
 * Load a credential and decrypt its payload (supports legacy plaintext rows).
 */
export async function getDecryptedCredential(credentialId: string) {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  })

  if (!credential || credential.data == null) {
    return null
  }

  if (!CREDENTIALS_ENCRYPTION_KEY) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is not configured')
  }
  const data = decryptCredentialData(credential.data, CREDENTIALS_ENCRYPTION_KEY)
  return { ...credential, data }
}
