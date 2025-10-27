'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@buzz8n/ui/components/sheet'
import { CheckCircle, Clock, XCircle, Loader2, Eye, RefreshCw } from 'lucide-react'
import { useInfiniteWorkflowExecutions } from '@/hooks/useWorkflow'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { ExecutionDetailView } from './ExecutionDetailView'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState } from 'react'

export function ExecutionsTab() {
  const { workflow, currentExecution } = useWorkflowEditorStore()
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const {
    data: infiniteExecutionsData,
    isLoading,
    error,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteWorkflowExecutions(workflow?.id || '', 10)

  // Flatten executions data and transform dates
  const executions =
    infiniteExecutionsData?.pages.flatMap((page) =>
      page.executions.map((execution) => ({
        ...execution,
        startedAt: new Date(execution.startedAt),
        finishedAt: execution.finishedAt ? new Date(execution.finishedAt) : undefined,
        logs: execution.logs.map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })),
      })),
    ) || []

  // Use infinite scroll hook
  const { sentinelRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  })

  const handleViewDetails = (executionId: string) => {
    setSelectedExecutionId(executionId)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setSelectedExecutionId(null)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'initial':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'loading':
        return 'secondary'
      case 'initial':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Create node labels map for the execution detail view
  const nodeLabels =
    workflow?.nodes.reduce(
      (acc, node) => {
        acc[node.id] = node.data.label
        return acc
      },
      {} as Record<string, string>,
    ) || {}

  const getNodeDisplayName = (nodeId: string) => {
    const label = nodeLabels[nodeId]
    if (label) {
      return `${label} (${nodeId})`
    }

    // Fallback: try to extract node type from log messages
    const allLogs = [...(currentExecution?.logs || []), ...executions.flatMap((e) => e.logs)]
    const logWithNodeId = allLogs.find((log) => log.nodeId === nodeId)
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Executions</h2>
            <p className="text-muted-foreground">View and manage workflow execution history</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading executions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load executions</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the execution history.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : executions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
              <p className="text-muted-foreground">
                Execute your workflow to see execution history here.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
              {/* Current Execution (if any) */}
              {currentExecution && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(currentExecution.status)}
                      <div>
                        <h3 className="font-semibold">Current Execution</h3>
                        <p className="text-sm text-muted-foreground">
                          Started {formatDate(currentExecution.startedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(currentExecution.status)}>
                      {currentExecution.status}
                    </Badge>
                  </div>

                  {/* Current Execution Details */}
                  <div className="space-y-2">
                    {currentExecution.summary && (
                      <div className="text-sm text-muted-foreground">
                        {currentExecution.summary}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Started: {formatDate(currentExecution.startedAt)}</span>
                      {currentExecution.finishedAt && (
                        <span>Finished: {formatDate(currentExecution.finishedAt)}</span>
                      )}
                      {currentExecution.durationMs && (
                        <span>Duration: {formatDuration(currentExecution.durationMs)}</span>
                      )}
                      <span>Logs: {currentExecution.logs?.length || 0}</span>
                    </div>

                    {currentExecution.logs && currentExecution.logs.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-2">Recent Logs:</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {currentExecution.logs.slice(-3).map((log, index) => (
                            <div key={log.id || index} className="text-xs bg-muted/50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {getNodeDisplayName(log.nodeId)}
                                </span>
                                <span className="font-mono">{formatTime(log.timestamp)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {log.status}
                                </Badge>
                              </div>
                              <div className="mt-1">{log.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Execution History */}
              <div className="space-y-3">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">Execution {execution.id.slice(-8)}</h4>
                            <Badge variant={getStatusVariant(execution.status)}>
                              {execution.status}
                            </Badge>
                          </div>
                          {execution.workflow && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-muted-foreground">From workflow:</span>
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
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>Started: {formatDate(execution.startedAt)}</span>
                            {execution.finishedAt && (
                              <span>Finished: {formatDate(execution.finishedAt)}</span>
                            )}
                            <span>Duration: {formatDuration(execution.durationMs)}</span>
                            <span>Logs: {execution.logs.length}</span>
                          </div>
                          {execution.summary && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {execution.summary}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(execution.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="py-4">
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Loading more executions...
                      </span>
                    </div>
                  )}
                  {!hasNextPage && executions.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      No more executions to load
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Execution Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle>Execution Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedExecutionId && executions.find((e) => e.id === selectedExecutionId) ? (
              <ExecutionDetailView
                execution={executions.find((e) => e.id === selectedExecutionId)!}
                nodeLabels={nodeLabels}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No execution details available
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
