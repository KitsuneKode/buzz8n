'use client'

import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { Play, Square, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'

export function ExecuteBar() {
  const {
    nodes,
    isExecuting,
    currentExecution,
    executeWorkflow,
    stopExecution,
    toggleLogsDrawer,
  } = useWorkflowEditorStore()

  const canExecute = nodes.length > 0 && !isExecuting
  const hasManualTrigger = nodes.some(node => node.data.type === 'manualTrigger')

  const getExecutionStatusIcon = () => {
    if (!currentExecution) return null
    
    switch (currentExecution.status) {
      case 'running':
        return <RotateCcw className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getExecutionStatusText = () => {
    if (!currentExecution) return null
    
    switch (currentExecution.status) {
      case 'running':
        return 'Executing...'
      case 'success':
        return `Completed in ${currentExecution.durationMs}ms`
      case 'failed':
        return 'Execution failed'
      default:
        return 'Queued'
    }
  }

  if (nodes.length === 0) return null

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center space-x-4">
        {/* Execute Button */}
        <Button
          onClick={isExecuting ? stopExecution : executeWorkflow}
          disabled={!canExecute && !isExecuting}
          className="flex items-center space-x-2"
          variant={isExecuting ? "destructive" : "default"}
        >
          {isExecuting ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop execution</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute workflow</span>
            </>
          )}
        </Button>

        {/* Execution Status */}
        {currentExecution && (
          <div className="flex items-center space-x-2">
            {getExecutionStatusIcon()}
            <span className="text-sm text-muted-foreground">
              {getExecutionStatusText()}
            </span>
            <Badge 
              variant={currentExecution.status === 'success' ? 'default' : 
                      currentExecution.status === 'failed' ? 'destructive' : 'secondary'}
            >
              {currentExecution.status}
            </Badge>
          </div>
        )}

        {/* Logs Button */}
        {currentExecution && currentExecution.logs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLogsDrawer}
          >
            View logs ({currentExecution.logs.length})
          </Button>
        )}

        {/* Manual Trigger Warning */}
        {!hasManualTrigger && nodes.length > 0 && (
          <div className="text-xs text-amber-600 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Add a trigger to activate this workflow</span>
          </div>
        )}
      </div>
    </div>
  )
}
