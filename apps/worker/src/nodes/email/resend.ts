import { emailFormSchema } from '@buzz8n/common/types'
import { renderTemplate } from '@/nodes/helper'
import type { ExecContext } from '@/nodes'
import { prisma } from '@buzz8n/store/'
import { logger } from '@/utils'
import { Resend } from 'resend'

export const sendResendEMail = async (
  config: Record<string, unknown> | undefined,
  credentialId: string | undefined,
  context: ExecContext,
) => {
  try {
    if (!credentialId || typeof config !== 'object') {
      throw new Error('Credentials to execute sendTelegram Message not provided')
    }

    const credential = await prisma.credential.findUnique({
      where: {
        id: credentialId,
      },
    })
    if (!credential || !credential.data) {
      throw new Error('Credential to execute sendTelegram Message does not exists')
    }
    const { data, success } = emailFormSchema.safeParse(credential.data)
    const { to, subject, body } = config as { to: string; subject: string; body: string }
    if (!success || !to || !subject || !body) {
      throw new Error('Invalid credential data')
    }

    // Render all template fields
    const resolvedTo = renderTemplate(to, context)
    const resolvedSubject = renderTemplate(subject, context)
    const resolvedBody = renderTemplate(body, context)

    // Log for debugging
    logger.info('Email config', {
      raw: { to, subject, body },
      resolved: { to: resolvedTo, subject: resolvedSubject, body: resolvedBody },
    })

    const resend = new Resend(data.resendApiKey)

    const { data: resp, error } = await resend.emails.send({
      from: data.email,
      to: resolvedTo,
      subject: resolvedSubject,
      text: resolvedBody,
    })

    if (error) {
      throw new Error(error.message)
    }
    logger.info('Email sent successfully', resp)
    return { status: 'ok', data: resp }
  } catch (error) {
    logger.error('Failed to send email', error)
    throw error
  }
}
