'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@buzz8n/ui/components/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@buzz8n/ui/components/card'
import { MoreHorizontal, Play, Pause, Trash2, Copy } from 'lucide-react'
import { WorkflowListData } from '@buzz8n/common/types'
import { useDeleteWorkflow } from '@/hooks/useWorkflow'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface WorkflowCardProps {
  workflow: WorkflowListData
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const deleteWorkflowMutation = useDeleteWorkflow()

  const handleResume = () => {
    startTransition(() => {
      router.push(`/workflow/${workflow.id}`)
    })
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteWorkflowMutation.mutateAsync(workflow.id)
    } catch {
      // Error handling is done in the mutation
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate workflow:', workflow.id)
  }

  const formatLastModified = () => {
    return formatDistanceToNow(workflow.updatedAt, { addSuffix: true })
  }

  const getStatusBadge = () => {
    if (workflow.active) {
      return <Badge variant="default">Active</Badge>
    } else {
      return <Badge variant="outline">Inactive</Badge>
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle
              className="text-lg font-semibold truncate group-hover:text-primary transition-colors"
              onClick={handleResume}
            >
              {workflow.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Modified {formatLastModified()}</p>
          </div>

          <div className="flex items-center gap-2 ml-2">
            {getStatusBadge()}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleResume}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {workflow.active ? (
              <Button variant="outline" size="sm" disabled>
                <Pause className="mr-2 h-4 w-4" />
                Paused
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <Play className="mr-2 h-4 w-4" />
                Stopped
              </Button>
            )}

            <Button variant="default" size="sm" onClick={handleResume} disabled={isPending}>
              {isPending ? 'Opening...' : 'Open'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
