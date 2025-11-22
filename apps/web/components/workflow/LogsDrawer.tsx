'use client'

import { X, Copy, Trash2, Info, XCircle, CheckCircle, Clock } from 'lucide-react'
import { NodeExecutionDetailDialog } from './NodeExecutionDetailDialog'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { Separator } from '@buzz8n/ui/components/separator'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { ExecutionLog } from '@/lib/types/workflow'
import { useState } from 'react'

// Legacy log format for backward compatibility
type LegacyLog = {
  id: string
  timestamp: Date
  nodeId: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: unknown
}

type LogEntry = ExecutionLog | LegacyLog

const getLogStatusIcon = (status: ExecutionLog['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />
    case 'loading':
      return <Clock className="w-4 h-4 text-blue-500" />
    default:
      return <Info className="w-4 h-4 text-gray-500" />
  }
}

const getLogStatusColor = (status: ExecutionLog['status']) => {
  switch (status) {
    case 'success':
      return 'border-l-green-500'
    case 'error':
      return 'border-l-red-500'
    case 'loading':
      return 'border-l-blue-500'
    default:
      return 'border-l-blue-500'
  }
}

export function LogsDrawer() {
  const { currentExecution, nodes, toggleLogsDrawer, clearLogs } = useWorkflowEditorStore()
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!currentExecution) return null

  const handleLogClick = (log: LogEntry) => {
    // Convert old log format to new format if needed
    const executionLog: ExecutionLog = {
      id: log.id,
      type: 'type' in log ? log.type : 'node_event',
      timestamp: log.timestamp,
      nodeId: log.nodeId,
      status: 'status' in log ? log.status : 'success',
      level: log.level,
      message: log.message,
      context:
        'context' in log
          ? log.context
          : 'data' in log && log.data
            ? { output: log.data }
            : undefined,
      metadata: 'metadata' in log ? log.metadata : undefined,
    }
    setSelectedLog(executionLog)
    setIsDialogOpen(true)
  }

  const handleCopyLogs = () => {
    const logsText = currentExecution.logs
      .map((log) => `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n')

    navigator.clipboard.writeText(logsText)
  }

  const getNodeDisplayName = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    const label = node?.data.label
    if (label) {
      return `${label} (${nodeId})`
    }

    // Fallback: try to extract node type from log messages
    const logWithNodeId = currentExecution.logs.find((log) => log.nodeId === nodeId)
    if (logWithNodeId) {
      const message = logWithNodeId.message
      // Extract node type from message like "Node nodeId (nodeType) message"
      const match = message.match(/Node\s+\w+\s+\(([^)]+)\)/)
      if (match && match[1]) {
        return `${match[1]} (${nodeId})`
      }
    }

    return nodeId
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 h-80">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Execution Logs</h3>
            <Badge variant="outline">{currentExecution.logs.length} entries</Badge>
            <Badge
              variant={
                currentExecution.status === 'success'
                  ? 'default'
                  : currentExecution.status === 'error'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {currentExecution.status}
            </Badge>

            <div className="flex items-center space-x-2">
              {currentExecution.summary && (
                <span className="text-sm text-muted-foreground">{currentExecution.summary}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLogs}
              disabled={currentExecution.logs.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={currentExecution.logs.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLogsDrawer}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Execution Summary */}
        <div className="px-4 py-2 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>Started: {formatTime(currentExecution.startedAt)}</span>
              {currentExecution.finishedAt && (
                <span>Finished: {formatTime(currentExecution.finishedAt)}</span>
              )}
              {currentExecution.durationMs && (
                <span>Duration: {currentExecution.durationMs}ms</span>
              )}
            </div>
            <span className="text-muted-foreground">{currentExecution.summary}</span>
          </div>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {currentExecution.logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No logs available</div>
              ) : (
                <div className="space-y-2">
                  {[...currentExecution.logs].reverse().map((log, index) => (
                    <div
                      key={log.id}
                      className={`border-l-2 pl-4 py-2 hover:bg-muted/30 transition-colors cursor-pointer rounded-r-lg ${getLogStatusColor(log.status)}`}
                      onClick={() => handleLogClick(log)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getLogStatusIcon(log.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="font-medium">{getNodeDisplayName(log.nodeId)}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.status}
                              </Badge>
                              <span className="text-muted-foreground">
                                {formatTime(log.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-1">{log.message}</p>
                            {('context' in log && log.context?.output) ||
                            ('data' in log && log.data) ? (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Has output data - click to view details
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {index < currentExecution.logs.length - 1 && <Separator className="mt-2" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Node Detail Dialog */}
      <NodeExecutionDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        log={selectedLog}
        nodeLabel={selectedLog ? getNodeDisplayName(selectedLog.nodeId) : undefined}
      />
    </div>
  )
}
