'use client'

import { useExecuteWorkflow, useUpdateWorkflow } from '@/hooks/useWorkflow'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import CredentialModal from '../credentials/CredentialModal'
import { useWebSocket } from '@/hooks/useWebSocket'
import { FloatingToolbar } from './FloatingToolbar'
import { ReactFlowProvider } from '@xyflow/react'
import { ExecutionsTab } from './ExecutionsTab'
import { useCallback, useEffect } from 'react'
import { RightPanel } from './RightPanel'
import { LogsDrawer } from './LogsDrawer'
import { ExecuteBar } from './ExecuteBar'
import { TopBar } from './TopBar'
import { Canvas } from './Canvas'

function WebSocketStatus() {
  const { isConnected, isConnecting, error } = useWebSocket()

  return (
    <div className="absolute top-2 right-2 z-50 bg-black/80 text-white px-2 py-1 rounded text-xs">
      WS:{' '}
      {isConnected
        ? '🟢 Connected'
        : isConnecting
          ? '🟡 Connecting...'
          : error
            ? '🔴 Disconnected'
            : '⚫ Offline'}
    </div>
  )
}

export function WorkflowEditor() {
  const {
    nodes,
    edges,
    workflow,
    activeTab,
    isLogsDrawerOpen,
    deleteSelectedNodes,
    isDirty,
    getNodesForSave,
  } = useWorkflowEditorStore()

  const { mutate: updateWorkflowMutate, isPending: isSaving } = useUpdateWorkflow()

  const { mutate: executeWorkflowMutate } = useExecuteWorkflow()

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (!workflow || !workflow.id || !nodes || !edges) {
        return
      }

      const target = event.target as HTMLElement
      // Check if user is typing in an input field
      const isEditableElement =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Pan mode shortcuts (H for hand/pan, V for selection/vector)
      if (!isEditableElement && (event.key === 'h' || event.key === 'H')) {
        event.preventDefault()
        const { setPanMode } = useWorkflowEditorStore.getState()
        setPanMode(true)
        return
      }
      if (!isEditableElement && (event.key === 'v' || event.key === 'V')) {
        event.preventDefault()
        const { setPanMode } = useWorkflowEditorStore.getState()
        setPanMode(false)
        return
      }

      // Delete selected nodes (Delete/Backspace)
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (!isEditableElement) {
          event.preventDefault()
          deleteSelectedNodes()
        }
      }

      // Save workflow (Cmd/Ctrl + S)
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        if (isSaving || !isDirty) return

        // Get nodes without runtime status field
        const nodesToSave = getNodesForSave()

        updateWorkflowMutate({
          id: workflow.id,
          data: {
            edges,
            nodes: nodesToSave,
            active: undefined,
          },
        })
      }

      // Execute workflow (Cmd/Ctrl + Enter)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        if (workflow) {
          executeWorkflowMutate(workflow.id)
        }
      }
    },
    [
      workflow,
      nodes,
      edges,
      isSaving,
      isDirty,
      updateWorkflowMutate,
      executeWorkflowMutate,
      deleteSelectedNodes,
      getNodesForSave,
    ],
  )

  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
        {/* Top Bar */}
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}

          {/* Main Content */}
          <div className="flex-1 flex flex-col relative">
            {/* WebSocket Status Indicator */}
            <WebSocketStatus />

            {activeTab === 'editor' && (
              <>
                <Canvas />
                <ExecuteBar />
                <FloatingToolbar />
              </>
            )}

            {activeTab === 'executions' && <ExecutionsTab />}

            {activeTab === 'evaluations' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Evaluations</h2>
                  <p className="text-muted-foreground">Evaluation results will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <CredentialModal />
          <RightPanel />
        </div>

        {/* Logs Drawer */}
        {isLogsDrawerOpen && <LogsDrawer />}
      </div>
    </ReactFlowProvider>
  )
}
