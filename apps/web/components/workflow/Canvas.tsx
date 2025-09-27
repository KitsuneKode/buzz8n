'use client'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  BackgroundVariant,
  ConnectionLineType,
} from '@xyflow/react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Fullscreen, Minus, Plus } from 'lucide-react'
import { Button } from '@buzz8n/ui/components/button'
import { WorkflowNode } from './nodes/WorkflowNode'
import { useCallback, useRef } from 'react'
import '@xyflow/react/dist/style.css'

const nodeTypes = {
  manualTrigger: WorkflowNode,
  telegramGetChat: WorkflowNode,
  emailSend: WorkflowNode,
  webhook: WorkflowNode,
  schedule: WorkflowNode,
  appEvent: WorkflowNode,
  formSubmission: WorkflowNode,
  executedByWorkflow: WorkflowNode,
  chatMessage: WorkflowNode,
  evaluation: WorkflowNode,
  other: WorkflowNode,
}

export function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow()

  const onFitView = useCallback(() => {
    fitView({ padding: 0.2 })
  }, [fitView])

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, toggleNodePalette, addNode } =
    useWorkflowEditorStore()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeData = event.dataTransfer.getData('application/reactflow')
      if (!nodeData) return

      const template = JSON.parse(nodeData)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(template, position)
    },
    [screenToFlowPosition, addNode],
  )

  const handleAddFirstStep = () => {
    toggleNodePalette()
  }

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        // fitView
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={{
          type: 'bezier',
          animated: false,
        }}
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-50" />
        <Panel
          position="bottom-right"
          className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse"
        >
          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground/80 hover:text-muted-foreground rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg size-10 focus-visible:z-10 bg-card"
            onClick={() => zoomIn()}
            aria-label="Zoom in"
          >
            <Plus className="size-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground/80 hover:text-muted-foreground rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg size-10 focus-visible:z-10 bg-card"
            onClick={() => zoomOut()}
            aria-label="Zoom out"
          >
            <Minus className="size-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground/80 hover:text-muted-foreground rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg size-10 focus-visible:z-10 bg-card"
            onClick={onFitView}
            aria-label="Fit view"
          >
            <Fullscreen className="size-5" aria-hidden="true" />
          </Button>
        </Panel>
        {/* Empty state */}
        {nodes.length === 0 && (
          <>
            <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  space-y-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddFirstStep}
                className="border-dashed border-2 h-24 w-48 flex flex-col items-center justify-center space-y-2 hover:border-primary/50"
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add first step...</span>
              </Button>
            </div>
          </>
        )}

        {/* Bottom status bar */}
        <Panel position="bottom-left" className="m-4">
          <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Logs</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
