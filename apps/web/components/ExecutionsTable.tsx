'use client'

import { Execution } from '@/stores/dashboard'
import { Badge } from '@buzz8n/ui/components/badge'
import { Button } from '@buzz8n/ui/components/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@buzz8n/ui/components/table'
import { Filter, CheckCircle, Clock, XCircle, Loader2, FileText, Play, Square } from 'lucide-react'

interface ExecutionsTableProps {
  executions: Execution[]
}

const ExecutionsTable = ({ executions }: ExecutionsTableProps) => {
  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRunTime = (ms: number) => {
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
      case 'running':
        return 'secondary'
      case 'failed':
        return 'destructive'
      case 'queued':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'running':
        return 'text-blue-500'
      case 'failed':
        return 'text-red-500'
      case 'queued':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 mr-1" />
      case 'running':
        return <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      case 'failed':
        return <XCircle className="w-3 h-3 mr-1" />
      case 'queued':
        return <Clock className="w-3 h-3 mr-1" />
      default:
        return null
    }
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
              <TableHead className="font-semibold text-card-foreground">Workflow</TableHead>
              <TableHead className="font-semibold text-card-foreground">Status</TableHead>
              <TableHead className="font-semibold text-card-foreground">Started</TableHead>
              <TableHead className="font-semibold text-card-foreground">Duration</TableHead>
              <TableHead className="font-semibold text-card-foreground">Execution ID</TableHead>
              <TableHead className="font-semibold text-card-foreground w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">No executions yet</p>
                      <p className="text-sm text-muted-foreground">Your workflow executions will appear here</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              executions.map((execution) => (
                <TableRow key={execution.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-card-foreground py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-primary" />
                      </div>
                      <span>{execution.workflowName}</span>
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
                    <span className="font-mono text-sm">{formatRunTime(execution.runTimeMs)}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-4">
                    <code className="bg-muted px-2 py-1 rounded">{execution.id}</code>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-1">
                      {execution.status === 'running' ? (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ExecutionsTable
