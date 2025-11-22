import { ExecutionLog } from '@/lib/types/workflow'

/**
 * Merges duplicate execution logs for the same node.
 * This is useful for historical executions where the backend stores both
 * "started" and "completed" logs separately.
 *
 * The function:
 * 1. Groups logs by nodeId
 * 2. If multiple logs exist for a node, merges them into one
 * 3. Preserves the start timestamp and adds timeline data
 *
 * @param logs - Array of execution logs
 * @returns Deduplicated array with merged logs
 */
export function mergeDuplicateLogs(logs: ExecutionLog[], reverse = false): ExecutionLog[] {
  const logsByNode = new Map<string, ExecutionLog[]>()

  // Group logs by nodeId
  for (const log of logs) {
    const existing = logsByNode.get(log.nodeId) || []
    existing.push(log)
    logsByNode.set(log.nodeId, existing)
  }

  const mergedLogs: ExecutionLog[] = []

  // Process each node's logs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, nodeLogs] of logsByNode.entries()) {
    if (nodeLogs.length === 1 && nodeLogs[0]) {
      // Single log, no merging needed
      mergedLogs.push(nodeLogs[0])
    } else {
      // Multiple logs for same node - merge them
      // Sort by timestamp to get started/completed order
      const sortedLogs = nodeLogs.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )

      const startedLog = sortedLogs[0]! // First log (usually status: loading)
      const completedLog = sortedLogs[sortedLogs.length - 1]! // Last log (success/error)

      // Merge the logs
      const mergedLog: ExecutionLog = {
        id: completedLog.id || startedLog.id,
        type: completedLog.type || startedLog.type,
        timestamp: startedLog.timestamp, // Keep original start timestamp
        nodeId: startedLog.nodeId,
        status: completedLog.status || startedLog.status,
        level: completedLog.level || startedLog.level,
        executionSummary: completedLog.executionSummary || startedLog.executionSummary,
        message: completedLog.message || startedLog.message,
        context: {
          ...startedLog.context,
          ...completedLog.context,
          // Add timeline data
          startedAt: startedLog.timestamp,
          endedAt: completedLog.timestamp,
          // Calculate duration if not present
          duration:
            completedLog.context?.duration ||
            new Date(completedLog.timestamp).getTime() - new Date(startedLog.timestamp).getTime(),
        },
        metadata: completedLog.metadata || startedLog.metadata,
      }

      mergedLogs.push(mergedLog)
    }
  }

  // Sort by timestamp to maintain chronological order
  const sortedLogs = mergedLogs.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  return reverse ? sortedLogs.reverse() : sortedLogs
}
