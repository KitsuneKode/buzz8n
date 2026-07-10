import type { ExecutionLog } from '@buzz8n/common/types'
import type { ExecContext } from '@/nodes'
import type { RFNode } from './graph'

/**
 * Converts node execution results to ExecutionLog format for persistence and real-time updates.
 * This helper extracts input, output, timing, and error information from the execution context.
 */
export function nodeResultToExecutionLog(
  nodeId: string,
  node: RFNode,
  ctx: ExecContext,
  startTime: number | undefined,
  endTime: number | undefined,
  error?: Error | string,
  metadata?: { workflowId?: string; executionId?: string; userId?: string },
  customStatus?: 'loading' | 'success' | 'error',
): ExecutionLog {
  const nodeResult = ctx.$node[nodeId]
  const duration = startTime && endTime ? endTime - startTime : undefined
  const status = customStatus || (error ? 'error' : 'success')

  // Use endTime for completed logs (success/error), startTime for loading logs.
  const timestamp = endTime ?? startTime ?? Date.now()

  return {
    id: `${nodeId}_${Date.now()}`,
    timestamp: new Date(timestamp),
    nodeId,
    type: 'node_event',
    status,
    level: error ? 'error' : 'info',
    message: error
      ? `Node ${nodeId} (${node.data?.type}) failed: ${typeof error === 'string' ? error : error.message}`
      : `Node ${nodeId} (${node.data?.type}) completed successfully`,
    context: {
      input: nodeResult?.input || node.data?.config || {},
      output: nodeResult?.output,
      error: error
        ? {
            message: typeof error === 'string' ? error : error.message,
          }
        : undefined,
      duration,
      startedAt: startTime ? new Date(startTime) : undefined,
      endedAt: endTime ? new Date(endTime) : undefined,
    },
    metadata,
  }
}
