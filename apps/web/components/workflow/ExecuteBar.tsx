'use client'

import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { CheckCircle, Clock, Play, XCircle } from 'lucide-react'
import { useExecuteWorkflow } from '@/hooks/useWorkflow'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'

/**
 * Render the workflow execution control bar shown at the bottom of the editor.
 *
 * Displays an Execute button (disabled when execution cannot start or a request is pending), current execution status with an icon and badge, a logs button when logs are available, and a warning if the workflow has no manual trigger. Returns nothing when there are no nodes in the workflow.
 *
 * @returns A JSX element representing the execution control bar, or `null` when the workflow contains no nodes.
 */
export function ExecuteBar() {
  const { nodes, workflow, currentExecution, toggleLogsDrawer } = useWorkflowEditorStore()

  const hasManualTrigger = nodes.some((node) => node.data.type === 'manualTrigger')
  const hasWebhook = nodes.some((node) => node.data.type === 'webhook')
  const canExecute = nodes.length > 0 && hasManualTrigger

  const { mutate: executeWorkflowMutate, isPending } = useExecuteWorkflow()

  const getExecutionStatusIcon = () => {
    if (!currentExecution) return null

    switch (currentExecution.status) {
      case 'loading':
        return null
      // return <Spinner className="size-4" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getExecutionStatusText = () => {
    if (!currentExecution) return null

    switch (currentExecution.status) {
      case 'loading':
        return 'Executing...'
      case 'success':
        return `Completed in ${currentExecution.durationMs}ms`
      case 'error':
        return 'Execution failed'
      default:
        return 'Queued'
    }
  }

  if (nodes.length === 0) return null
  return (
    <div className="relative">
      {/* other page content */}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
          {currentExecution?.status === 'loading' ? (
            <Spinner className="size-6 ml-4 mb-0 mt-6 inline-block" />
          ) : (
            <Button
              onClick={() => {
                if (!workflow || isPending || !canExecute) return

                executeWorkflowMutate(workflow.id)
              }}
              disabled={!canExecute || isPending}
              className="flex items-center space-x-2"
              variant={isPending ? 'destructive' : 'default'}
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  {/* <Square className="w-4 h-4" /> */}
                  {/* <span>Stop execution</span> */}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute workflow</span>
                </>
              )}
            </Button>
          )}

          {/* Execution Status */}
          {currentExecution && (
            <div className="flex items-center space-x-2">
              {getExecutionStatusIcon()}
              <span className="text-sm text-muted-foreground">{getExecutionStatusText()}</span>
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
            </div>
          )}

          {/* Logs Button */}
          {currentExecution && currentExecution.logs.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleLogsDrawer}>
              View logs ({currentExecution.logs.length})
            </Button>
          )}

          {!hasManualTrigger && nodes.length > 0 && (
            <div className="text-xs text-amber-600 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Add a manual trigger to execute this workflow</span>
            </div>
          )}

          {/* Manual Trigger Warning */}
          {!hasManualTrigger && !hasWebhook && nodes.length > 0 && (
            <div className="text-xs text-amber-600 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Add a trigger to activate this workflow</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
