/**
 * Run from the repository root:
 * CREDENTIALS_ENCRYPTION_KEY=... bun run packages/store/prisma/scripts/encrypt-credentials.ts
 */
import { encryptCredentialData, isCredentialEnvelope } from '@buzz8n/backend-common/crypto'
import { prisma } from '@buzz8n/store'

async function main(): Promise<void> {
  if (!process.env.CREDENTIALS_ENCRYPTION_KEY) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY is required')
  }

  const credentials = await prisma.credential.findMany({
    select: {
      id: true,
      data: true,
    },
  })

  let encrypted = 0
  let alreadyEncrypted = 0
  let skippedInvalid = 0

  for (const credential of credentials) {
    if (isCredentialEnvelope(credential.data)) {
      alreadyEncrypted += 1
      continue
    }

    if (
      typeof credential.data !== 'object' ||
      credential.data === null ||
      Array.isArray(credential.data)
    ) {
      skippedInvalid += 1
      continue
    }

    const envelope = await encryptCredentialData(credential.data as Record<string, unknown>)
    await prisma.credential.update({
      where: { id: credential.id },
      data: { data: envelope },
    })
    encrypted += 1
  }

  console.log('Credential encryption migration complete', {
    total: credentials.length,
    encrypted,
    alreadyEncrypted,
    skippedInvalid,
  })
}

try {
  await main()
} catch (error) {
  console.error('Credential encryption migration failed', error)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
