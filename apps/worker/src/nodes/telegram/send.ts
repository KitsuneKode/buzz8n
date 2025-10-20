import { prisma } from '@buzz8n/store/'
import { logger } from '@/utils'

export const sendTelegramMessage = async (
  config: Record<string, unknown> | undefined,
  credentialId: string | undefined,
  context: any,
) => {
  try {
    console.log('credential id', credentialId)
    if (!credentialId) {
      throw new Error('Credentials to execute sendTelegram Message not provided')
    }

    logger.info('credentialId', credentialId)
    const credential = await prisma.credential.findUnique({
      where: {
        id: credentialId,
      },
    })

    // const {}= (credential?.data as ) ?? ''
    // logger.info('credentials', credential)

    if (!credential) {
      throw new Error('Credential to execute sendTelegram Message does not exists')
    }
  } catch (error) {
    throw error
  }
}
