import { loadCredentialData } from '@/nodes/load-credential'
import { telegramFormSchema } from '@buzz8n/common/types'
import { renderTemplate } from '@/nodes/helper'
import type { ExecContext } from '@/nodes'
import { logger } from '@/utils'
import axios from 'axios'

export const sendTelegramMessage = async (
  config: Record<string, unknown> | undefined,
  credentialId: string | undefined,
  context: ExecContext,
) => {
  try {
    if (!credentialId || typeof config !== 'object') {
      throw new Error('Credentials to execute sendTelegram Message not provided')
    }

    const plain = await loadCredentialData(credentialId, context.userId)
    const { data, success } = telegramFormSchema.safeParse(plain)
    const { message, chatId } = config
    if (!success || !message || !chatId) {
      throw new Error('Invalid credential data')
    }

    // Render templates using context
    const resolvedMessage = renderTemplate(message, context)
    const resolvedChatId = renderTemplate(chatId, context)

    logger.info('Telegram config', {
      messageLength: String(resolvedMessage).length,
      chatIdPresent: Boolean(resolvedChatId),
    })

    const { botToken } = data
    const resp = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      { text: resolvedMessage, chat_id: resolvedChatId },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
    )
    logger.info('Telegram message sent successfully', resp.data)
    return { status: 'ok', data: resp.data }
  } catch (error) {
    logger.error('Failed to send Telegram message', error)
    throw error
  }
}
