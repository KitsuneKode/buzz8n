import type { RFNode } from '@/processor/dag'
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
  switch (node.data?.type) {
    case 'telegramSendMessage':
      console.log('telegram')
      await sleep(5000)
      // TODO: invoke Telegram API using node.data.config and context.$node
      return { status: 'ok' }
    case 'emailSend':
      console.log('email')
      await sleep(5000)
      // TODO: send email using provider/credentials in node.data.config
      return { status: 'ok' }
    case 'aiAgent':
      // TODO: call your model/tooling with inputs from context.$node
      console.log('aiAgent')
      await sleep(5000)
      return { status: 'ok' }
    default:
      // Default: no-op success so downstream edges can proceed
      await sleep(5000)
      return { status: 'ok' }
  }
}
