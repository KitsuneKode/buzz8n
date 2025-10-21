import { nodeDataSchema, nodeSchema } from '@buzz8n/common/types'
import { sendTelegramMessage } from '@/nodes/telegram/send'
import { sendResendEMail } from './email/resend'
import type { RFNode } from '@/processor/dag'
import { logger } from '@/utils'
import { sleep } from 'bun'

/**
 *
 * Shared execution context:
 *  - $json.body carries the trigger payload or initial input to the workflow.
 *  - $node accumulates previous node results, addressable as $node[nodeId].
 *
 */
export type ExecContext = {
  $json: { body: any }
  $node: Record<string, NodeResult>
}

/**
 * Generic result produced by a node's execution; downstream nodes can read these via ctx.$node.
 */
export type NodeResult = any

/**
 *
 * Contract for executing a single node: given the node and context, return its result asynchronously.
 * Implementations may throw to signal failure, which can trigger fail-fast behavior in the scheduler.
 *
 */
export type RunNode = (node: RFNode, context: ExecContext) => Promise<NodeResult>

export const runNode: RunNode = async (node, context) => {
  const { success, data } = nodeDataSchema.safeParse(node.data)
  if (!success) {
    logger.error('Invalid node data', { nodeData: node.data })
    throw new Error('Invalid node data')
  }
  switch (data.type) {
    case 'telegramSendMessage':
      return await sendTelegramMessage(data.config, data.credentials?.id, context)

    case 'emailSend':
      return await sendResendEMail(data.config, data.credentials?.id, context)
    case 'aiAgent':
      // TODO: call your model/tooling with inputs from context.$node
      console.log('aiAgent')
      await sleep(5000)
      return { status: 'ok' }
    default:
      throw new Error(`Unsupported node type: ${data.type}`)
  }
}
