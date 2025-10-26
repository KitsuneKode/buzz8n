'use client'

import { Copy, Trash2, Info, XCircle, Clock, CheckCircle } from 'lucide-react'
import { NodeExecutionDetailDialog } from './NodeExecutionDetailDialog'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { ExecutionLog, Execution } from '@/lib/types/workflow'
import { Separator } from '@buzz8n/ui/components/separator'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState } from 'react'

interface ExecutionDetailViewProps {
  execution: Execution
  nodeLabels?: Record<string, string>
  onClearLogs?: () => void
}

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

const getStatusIcon = (status: Execution['status']) => {
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

const getStatusVariant = (status: Execution['status']) => {
  switch (status) {
    case 'success':
      return 'default'
    case 'error':
      return 'destructive'
    case 'loading':
      return 'secondary'
    default:
      return 'outline'
  }
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

const formatDuration = (ms?: number) => {
  if (!ms) return 'N/A'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function ExecutionDetailView({
  execution,
  nodeLabels = {},
  onClearLogs,
}: ExecutionDetailViewProps) {
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleLogClick = (log: ExecutionLog) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  const handleCopyLogs = () => {
    const logsText = execution.logs
      .map((log) => `[${log.timestamp.toISOString()}] ${log.status.toUpperCase()}: ${log.message}`)
      .join('\n')

    navigator.clipboard.writeText(logsText)
  }

  const getNodeDisplayName = (nodeId: string) => {
    const label = nodeLabels[nodeId]
    if (label) {
      return `${label} (${nodeId})`
    }

    // Fallback: try to extract node type from log messages
    const logWithNodeId = execution.logs.find((log) => log.nodeId === nodeId)
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

  return (
    <>
      <div className="space-y-6">
        {/* Execution Summary Header */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(execution.status)}
              <div>
                <h3 className="text-lg font-semibold">Execution Details</h3>
                {execution.workflow && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">From workflow:</span>
                    <Badge variant="outline" className="text-xs">
                      {execution.workflow.name}
                    </Badge>
                    {!execution.workflow.active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Badge variant={getStatusVariant(execution.status)}>{execution.status}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopyLogs}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Logs
              </Button>
              {onClearLogs && (
                <Button variant="outline" size="sm" onClick={onClearLogs}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Execution Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Started</span>
              </div>
              <p className="text-sm font-mono mt-1">{formatTime(execution.startedAt)}</p>
            </div>

            {execution.finishedAt && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Finished</span>
                </div>
                <p className="text-sm font-mono mt-1">{formatTime(execution.finishedAt)}</p>
              </div>
            )}

            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-sm font-mono mt-1">{formatDuration(execution.durationMs)}</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Logs</span>
              </div>
              <p className="text-sm font-mono mt-1">{execution.logs.length} entries</p>
            </div>
          </div>

          {execution.summary && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm">{execution.summary}</p>
            </div>
          )}
        </div>

        {/* Logs Content */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold">Execution Logs</h4>
            <p className="text-sm text-muted-foreground">
              Click on any log entry to view detailed output
            </p>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {execution.logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No logs available</div>
              ) : (
                <div className="space-y-2">
                  {execution.logs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`border-l-2 pl-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer rounded-r-lg ${getLogStatusColor(log.status)}`}
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
                            {log.context?.output && (
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Has output data - click to view details
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {index < execution.logs.length - 1 && <Separator className="mt-2" />}
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
    </>
  )
}
