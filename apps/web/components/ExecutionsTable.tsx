'use client'

import {
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  FileText,
  Play,
  Square,
  Eye,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@buzz8n/ui/components/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@buzz8n/ui/components/sheet'
import { ExecutionDetailView } from './workflow/ExecutionDetailView'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useInfiniteExecutions } from '@/hooks/useWorkflow'
import { useExecutionDetail } from '@/hooks/useWorkflow'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { Execution } from '@/lib/types/workflow'
import { useState } from 'react'

interface ExecutionsTableProps {
  executions?: Execution[]
}

const ExecutionsTable = ({ executions: initialExecutions }: ExecutionsTableProps) => {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Use infinite query for executions
  const {
    data: infiniteExecutionsData,
    isLoading,
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

  // Use initial executions if provided (for backward compatibility), otherwise use infinite query data
  const displayExecutions = initialExecutions || executions

  const { data: executionDetail, isLoading: isLoadingDetail } = useExecutionDetail(
    selectedExecutionId || '',
  )
  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRunTime = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getStatusVariant = (status: Execution['status']) => {
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

  const getStatusColor = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'loading':
        return 'text-blue-500'
      case 'initial':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 mr-1" />
      case 'error':
        return <XCircle className="w-3 h-3 mr-1" />
      case 'loading':
        return <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      case 'initial':
        return <Clock className="w-3 h-3 mr-1" />
      default:
        return <Clock className="w-3 h-3 mr-1" />
    }
  }

  const handleViewDetails = (executionId: string) => {
    setSelectedExecutionId(executionId)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setSelectedExecutionId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Executions</h2>
          <p className="text-muted-foreground">Monitor your workflow execution history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="font-semibold text-card-foreground">
                Execution & Workflow
              </TableHead>
              <TableHead className="font-semibold text-card-foreground">Status</TableHead>
              <TableHead className="font-semibold text-card-foreground">Started</TableHead>
              <TableHead className="font-semibold text-card-foreground">Duration</TableHead>
              <TableHead className="font-semibold text-card-foreground">Execution ID</TableHead>
              <TableHead className="font-semibold text-card-foreground w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span>Loading executions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayExecutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">No executions yet</p>
                      <p className="text-sm text-muted-foreground">
                        Your workflow executions will appear here
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {displayExecutions.map((execution) => (
                  <TableRow key={execution.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-card-foreground py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Execution {execution.id.slice(-8)}</div>
                          {execution.workflow && (
                            <div className="text-xs text-muted-foreground">
                              From: {execution.workflow.name}
                              {!execution.workflow.active && (
                                <span className="ml-1 text-orange-500">(Inactive)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={getStatusVariant(execution.status)}
                        className={`flex items-center w-fit space-x-1 ${getStatusColor(execution.status)}`}
                      >
                        {getStatusIcon(execution.status)}
                        <span className="capitalize">{execution.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {formatDate(execution.startedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      <span className="font-mono text-sm">
                        {formatRunTime(execution.durationMs)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-4">
                      <code className="bg-muted px-2 py-1 rounded">{execution.id}</code>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(execution.id)}
                          title="View execution details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {execution.status === 'loading' ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Square className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Infinite scroll sentinel */}
                <TableRow>
                  <TableCell colSpan={6} className="py-4">
                    <div ref={sentinelRef} className="text-center">
                      {isFetchingNextPage && (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">
                            Loading more executions...
                          </span>
                        </div>
                      )}
                      {!hasNextPage && displayExecutions.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          No more executions to load
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Execution Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle>Execution Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading execution details...</span>
              </div>
            ) : executionDetail ? (
              <ExecutionDetailView execution={executionDetail} />
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

export default ExecutionsTable
