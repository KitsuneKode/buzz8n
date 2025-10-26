'use client'

import { useExecuteWorkflow, useUpdateWorkflow } from '@/hooks/useWorkflow'
import { useWebSocket, useWebSocketStore } from '@/hooks/useWebSocket'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import CredentialModal from '../credentials/CredentialModal'
import { FloatingToolbar } from './FloatingToolbar'
import { ReactFlowProvider } from '@xyflow/react'
import { useCallback, useEffect } from 'react'
import { RightPanel } from './RightPanel'
import { LogsDrawer } from './LogsDrawer'
import { ExecuteBar } from './ExecuteBar'
import { TopBar } from './TopBar'
import { Canvas } from './Canvas'
import { ExecutionsTab } from './ExecutionsTab'

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
  const { nodes, edges, workflow, activeTab, isLogsDrawerOpen, deleteSelectedNodes, isDirty } =
    useWorkflowEditorStore()

  const { mutate: updateWorkflowMutate, isPending: isSaving } = useUpdateWorkflow()

  const { mutate: executeWorkflowMutate } = useExecuteWorkflow()

  // Connect WebSocket on mount
  useEffect(() => {
    const { connect, disconnect } = useWebSocketStore.getState()
    connect()
    return () => {
      disconnect()
    }
  }, [])

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (!workflow || !workflow.id || !nodes || !edges) {
        return
      }
      // Delete selected nodes (Delete/Backspace)
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (event.target === document.body) {
          event.preventDefault()
          deleteSelectedNodes()
        }
      }

      // Save workflow (Cmd/Ctrl + S)
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        if (isSaving || !isDirty) return
        updateWorkflowMutate({
          id: workflow.id,
          data: {
            edges,
            nodes,
            active: workflow.active,
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
