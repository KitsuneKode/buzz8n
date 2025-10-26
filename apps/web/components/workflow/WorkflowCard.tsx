'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@buzz8n/ui/components/alert-dialog'

import { CheckCircle, Clock, Pause, Play, RotateCcw, Trash, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@buzz8n/ui/components/card'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { WorkflowListData } from '@buzz8n/common/types'
import { useDeleteWorkflow } from '@/hooks/useWorkflow'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import { Badge } from '@buzz8n/ui/components/badge'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface WorkflowCardProps {
  workflow: WorkflowListData
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const router = useRouter()
  const [isDeleting, startTransition] = useTransition()
  const [isPending, startTransitionResume] = useTransition()
  const deleteWorkflowMutation = useDeleteWorkflow()

  const handleResume = () => {
    startTransitionResume(() => {
      router.push(`/workflow/${workflow.id}`)
    })
  }

  const handleDelete = async () => {
    try {
      startTransition(async () => {
        await deleteWorkflowMutation.mutateAsync(workflow.id)
      })
    } catch {
      toast.error('Failed to delete workflow')
    }
  }

  console.log(workflow)
  // const handleDuplicate = () => {
  //   // TODO: Implement duplicate functionality
  //   console.log('Duplicate workflow:', workflow.id)
  // }

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

          <div className="flex items-center gap-4 ml-2">
            {getStatusBadge()}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={isDeleting}>
                  {isDeleting ? <Spinner className="size-4" /> : <Trash className="size-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the workflow and all
                    its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* <DropdownMenu>
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
            </DropdownMenu> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {workflow.status == 'loading' && (
            <Button variant="outline" size="sm" disabled>
              <Spinner className="mr-2 size-4 animate-spin text-blue-600" />
              Running
            </Button>
          )}
          {workflow.status == 'initial' && (
            <Button variant="outline" size="sm" disabled>
              <Clock className="mr-2 size-4" />
              Not Executed
            </Button>
          )}
          {workflow.status == 'success' && (
            <Button variant="outline" size="sm" disabled className="bg-green-600/40 text-green-300">
              <CheckCircle className="mr-2 size-4" />
              Success
            </Button>
          )}

          {workflow.status == 'error' && (
            <Button variant="destructive" size="sm" disabled>
              <XCircle className="mr-2 size-4 text-red-600" />
              Failed
            </Button>
          )}

          <Button variant="default" size="sm" onClick={handleResume} disabled={isPending}>
            {isPending ? <Spinner className="mr-2 size-4 animate-spin text-blue-600" /> : 'Open'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
