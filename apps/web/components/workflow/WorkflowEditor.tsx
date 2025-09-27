'use client'

import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { FloatingToolbar } from './FloatingToolbar'
import { ReactFlowProvider } from '@xyflow/react'
import { RightPanel } from './RightPanel'
import { LogsDrawer } from './LogsDrawer'
import { ExecuteBar } from './ExecuteBar'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Canvas } from './Canvas'
import { useEffect } from 'react'

export function WorkflowEditor() {
  const {
    workflow,
    activeTab,
    isLogsDrawerOpen,
    deleteSelectedNodes,
    saveWorkflow,
    executeWorkflow,
  } = useWorkflowEditorStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Save workflow (Cmd/Ctrl + S)
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        saveWorkflow()
      }

      // Execute workflow (Cmd/Ctrl + Enter)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        executeWorkflow()
      }

      // Delete selected nodes (Delete/Backspace)
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (event.target === document.body) {
          event.preventDefault()
          deleteSelectedNodes()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [saveWorkflow, executeWorkflow, deleteSelectedNodes])

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
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col relative">
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
          <RightPanel />
        </div>

        {/* Logs Drawer */}
        {isLogsDrawerOpen && <LogsDrawer />}
      </div>
    </ReactFlowProvider>
  )
}
