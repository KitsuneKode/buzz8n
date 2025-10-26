'use client'

import { useUpdateWorkflow, useExecuteWorkflow } from '@/hooks/useWorkflow'
import { useWebSocket, useWebSocketStore } from '@/hooks/useWebSocket'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import CredentialModal from '../credentials/CredentialModal'
import { FloatingToolbar } from './FloatingToolbar'
import { ReactFlowProvider } from '@xyflow/react'
import { RightPanel } from './RightPanel'
import { LogsDrawer } from './LogsDrawer'
import { ExecuteBar } from './ExecuteBar'
import { TopBar } from './TopBar'
import { Canvas } from './Canvas'
import { useEffect } from 'react'

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
  const { nodes, edges, workflow, activeTab, isLogsDrawerOpen, deleteSelectedNodes, saveWorkflow } =
    useWorkflowEditorStore()

  const { mutate: updateWorkflowMutate } = useUpdateWorkflow()
  const { mutate: executeWorkflowMutate } = useExecuteWorkflow()

  // Connect WebSocket on mount
  useEffect(() => {
    const { connect } = useWebSocketStore.getState()
    connect()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
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
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    saveWorkflow,
    executeWorkflowMutate,
    deleteSelectedNodes,
    nodes,
    updateWorkflowMutate,
    workflow,
    edges,
  ])

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

            {activeTab === 'executions' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Executions</h2>
                  <p className="text-muted-foreground">Execution history will appear here</p>
                </div>
              </div>
            )}

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
