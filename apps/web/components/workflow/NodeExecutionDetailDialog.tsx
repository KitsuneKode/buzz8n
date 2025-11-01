'use client'

import { Copy, ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@buzz8n/ui/components/dialog'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { Separator } from '@buzz8n/ui/components/separator'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { ExecutionLog } from '@/lib/types/workflow'
import { useState } from 'react'

interface NodeExecutionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: ExecutionLog | null
  nodeLabel?: string
}

const getStatusIcon = (status: ExecutionLog['status']) => {
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

const getStatusVariant = (status: ExecutionLog['status']) => {
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

export function NodeExecutionDetailDialog({
  open,
  onOpenChange,
  log,
  nodeLabel,
}: NodeExecutionDetailDialogProps) {
  const [showVerboseDetails, setShowVerboseDetails] = useState(false)

  if (!log) return null

  const handleCopyOutput = () => {
    if (log.context?.output) {
      navigator.clipboard.writeText(JSON.stringify(log.context.output, null, 2))
    }
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getStatusIcon(log.status)}
            <span>{nodeLabel ? `${nodeLabel} ` : log.nodeId}</span>
            <Badge variant={getStatusVariant(log.status)} className="ml-auto">
              {log.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {formatDuration(log.context?.duration)}
                </p>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Level</span>
                </div>
                <p className="text-lg font-semibold mt-1 capitalize">{log.level}</p>
              </div>
            </div>

            {/* Execution Timeline */}
            {(log.context?.startedAt || log.context?.endedAt) && (
              <div className="bg-muted/20 p-4 rounded-lg border">
                <h4 className="text-sm font-semibold mb-3">Execution Timeline</h4>
                <div className="space-y-2">
                  {log.context?.startedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Started at:</span>
                      <span className="text-sm font-mono">{formatTime(log.context.startedAt)}</span>
                    </div>
                  )}
                  {log.context?.endedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ended at:</span>
                      <span className="text-sm font-mono">{formatTime(log.context.endedAt)}</span>
                    </div>
                  )}
                  {log.context?.startedAt && log.context?.endedAt && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Total Duration:</span>
                      <span className="text-sm font-semibold">
                        {formatDuration(
                          new Date(log.context.endedAt).getTime() -
                            new Date(log.context.startedAt).getTime(),
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-4">
              {/* Message */}
              <div>
                <h4 className="text-sm font-medium mb-2">Message</h4>
                <p className="text-sm bg-muted/30 p-3 rounded-lg">{log.message}</p>
              </div>

              {/* Output Data */}
              {log.context?.output && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Output Data</h4>
                    <Button variant="outline" size="sm" onClick={handleCopyOutput}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Output
                    </Button>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg overflow-hidden">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                      {JSON.stringify(log.context.output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Data */}
              {log.context?.error && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-red-600">Error Details</h4>
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg overflow-hidden">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word text-red-800 dark:text-red-200">
                      {JSON.stringify(log.context.error, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Verbose Details Section */}
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setShowVerboseDetails(!showVerboseDetails)}
                  className="flex items-center space-x-2 p-0 h-auto"
                >
                  {showVerboseDetails ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Verbose Details</span>
                </Button>

                {showVerboseDetails && (
                  <div className="mt-3 space-y-4">
                    <Separator />

                    {/* Input Configuration */}
                    {log.context?.input && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Input Configuration</h5>
                        <div className="bg-muted/30 p-3 rounded-lg overflow-hidden">
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                            {JSON.stringify(log.context.input, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {log.metadata && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Metadata</h5>
                        <div className="bg-muted/30 p-3 rounded-lg overflow-hidden">
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Full Log Data */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium">Complete Log Data</h5>
                        <Button variant="outline" size="sm" onClick={handleCopyAll}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </Button>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg overflow-hidden">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
