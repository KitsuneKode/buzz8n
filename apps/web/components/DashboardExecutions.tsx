'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@buzz8n/ui/components/select'
import { Calendar, CheckCircle, Clock, Eye, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@buzz8n/ui/components/sheet'
import { ExecutionDetailView } from './workflow/ExecutionDetailView'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useInfiniteExecutions } from '@/hooks/useWorkflow'
import { Button } from '@buzz8n/ui/components/button'
import { Input } from '@buzz8n/ui/components/input'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState } from 'react'

interface DashboardExecutionsProps {
  workflowId?: string // If provided, show executions for specific workflow
}

export function DashboardExecutions({ workflowId }: DashboardExecutionsProps) {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const {
    data: infiniteExecutionsData,
    isLoading,
    error,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteExecutions(10)

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

  // Filter executions based on search term and status
  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch =
      execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.workflow?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {workflowId ? 'Workflow Executions' : 'All Executions'}
          </h2>
          <p className="text-muted-foreground">Monitor your workflow execution history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search executions or workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="loading">Running</SelectItem>
            <SelectItem value="initial">Initial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading executions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
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
        ) : filteredExecutions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'No matching executions'
                  : 'No executions yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Execute your workflows to see execution history here.'}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-3">
              {filteredExecutions.map((execution) => (
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
                          <p className="text-sm text-muted-foreground mt-1">{execution.summary}</p>
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
                {!hasNextPage && filteredExecutions.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    No more executions to load
                  </div>
                )}
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
            {selectedExecutionId && executions?.find((e) => e.id === selectedExecutionId) ? (
              <ExecutionDetailView
                execution={executions?.find((e) => e.id === selectedExecutionId)!}
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
