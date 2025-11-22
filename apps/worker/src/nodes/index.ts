/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendTelegramMessage } from '@/nodes/telegram/send'
import type { ExecutionLog } from '@buzz8n/common/types'
import { nodeDataSchema } from '@buzz8n/common/types'
import { sendResendEMail } from './email/resend'
import { runAiAgent } from './ai-agent/agent'
import type { RFNode } from '@/processor/dag'
import { logger } from '@/utils'
import { sleep } from 'bun'

/**
 *
 * Shared execution context:
 *  - $json.body carries the trigger payload or initial input to the workflow.
 *  - $json[nodeType] carries resolved configs from previous nodes (e.g., $json.email1.to)
 *  - $node accumulates previous node results with both input and output data.
 *
 */
export type ExecContext = {
  logs?: ExecutionLog[]
  $json: {
    body: any
    executionId: string
    workflowId: string
    [key: string]: any // For resolved configs like email1, telegram1, etc.
  }
  $node: Record<
    string,
    {
      input: Record<string, any> // Node's input config
      output: NodeResult // Node's output result
    }
  >
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
    logger.warn('Invalid node data (user configuration error)', {
      nodeId: node.id,
      nodeData: node.data,
    })
    throw new Error('Invalid node data')
  }
  await sleep(3000)
  switch (data.type) {
    case 'telegramSendMessage':
      return await sendTelegramMessage(data.config, data.credentials?.id, context)
    case 'emailSend':
      return await sendResendEMail(data.config, data.credentials?.id, context)
    case 'aiAgent':
      return await runAiAgent(data.config, data.credentials?.id, context)
    default:
      logger.warn('Unsupported node type (user configuration error)', {
        nodeId: node.id,
        type: data.type,
      })
      throw new Error(`Unsupported node type: ${data.type}`)
  }
}
