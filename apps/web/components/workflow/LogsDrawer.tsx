'use client'

import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { Separator } from '@buzz8n/ui/components/separator'
import { X, Copy, Trash2, Info, AlertTriangle, XCircle, Bug } from 'lucide-react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { ExecutionLog } from '@/lib/types/workflow'

const getLevelIcon = (level: ExecutionLog['level']) => {
  switch (level) {
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />
    case 'warn':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />
    case 'debug':
      return <Bug className="w-4 h-4 text-gray-500" />
    default:
      return <Info className="w-4 h-4 text-blue-500" />
  }
}

const getLevelColor = (level: ExecutionLog['level']) => {
  switch (level) {
    case 'info':
      return 'border-l-blue-500'
    case 'warn':
      return 'border-l-yellow-500'
    case 'error':
      return 'border-l-red-500'
    case 'debug':
      return 'border-l-gray-500'
    default:
      return 'border-l-blue-500'
  }
}

export function LogsDrawer() {
  const {
    currentExecution,
    nodes,
    toggleLogsDrawer,
    clearLogs,
  } = useWorkflowEditorStore()

  if (!currentExecution) return null

  const handleCopyLogs = () => {
    const logsText = currentExecution.logs
      .map(log => `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n')
    
    navigator.clipboard.writeText(logsText)
  }

  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    return node?.data.label || nodeId
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 h-80">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Execution Logs</h3>
            <Badge variant="outline">
              {currentExecution.logs.length} entries
            </Badge>
            <Badge 
              variant={currentExecution.status === 'success' ? 'default' : 
                      currentExecution.status === 'failed' ? 'destructive' : 'secondary'}
            >
              {currentExecution.status}
            </Badge>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLogsDrawer}
            >
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
        <ScrollArea className="flex-1">
          <div className="p-4">
            {currentExecution.logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs available
              </div>
            ) : (
              <div className="space-y-2">
                {currentExecution.logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`border-l-2 pl-4 py-2 hover:bg-muted/30 transition-colors ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-medium">{getNodeLabel(log.nodeId)}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.level}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mt-1">{log.message}</p>
                          {log.data && (
                            <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < currentExecution.logs.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
