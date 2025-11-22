'use client'

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Panel,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react'
import { Fullscreen, Minus, Plus, Hand, MousePointer2 } from 'lucide-react'
import DeleteButtonEdge from '@/components/react-flow/delete-button-edge'
import AiAgentToolEdge from '@/components/react-flow/ai-agent-tool-edge'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Button } from '@buzz8n/ui/components/button'
import { nodeTypeSchema } from '@buzz8n/common/types'
import { WorkflowNode } from './nodes/WorkflowNode'
import { useCallback, useRef } from 'react'
import '@xyflow/react/dist/style.css'

const nodeTypes = Object.fromEntries(
  Object.values(nodeTypeSchema.enum).map((type) => [type, WorkflowNode]),
)

const edgeTypes = {
  deleteEdge: DeleteButtonEdge,
  aiAgentTool: AiAgentToolEdge,
}

/**
 * Renders the main ReactFlow-based canvas for editing workflows, including node and edge rendering, drag-and-drop node creation, zoom and fit controls, pane interactions, and an empty-state call to add the first step.
 *
 * @returns The React element containing the interactive diagram editor with a dotted background, control panels (zoom/fit), node/edge handling, and an empty-state CTA when there are no nodes.
 */
export function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow()

  const onFitView = useCallback(() => {
    fitView({ padding: 0.2 })
  }, [fitView])

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    toggleNodePalette,
    addNode,
    isFitView,
    closeRightPanel,
    isPanMode,
    togglePanMode,
  } = useWorkflowEditorStore()

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

  const handlePaneClick = () => {
    closeRightPanel()
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
        fitView={isFitView}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={{
          type: 'deleteEdge',
          animated: false,
          className: 'stroke-2',
        }}
        className="bg-background"
        onPaneClick={handlePaneClick}
        panOnDrag={isPanMode}
        selectionOnDrag={!isPanMode}
        panOnScroll={true}
        selectionKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-50" />
        <Panel
          position="bottom-right"
          className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse"
        >
          <Button
            variant={isPanMode ? 'default' : 'outline'}
            size="icon"
            className="text-muted-foreground/80 hover:text-muted-foreground rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg size-10 focus-visible:z-10 bg-card data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            onClick={togglePanMode}
            aria-label={isPanMode ? 'Switch to selection mode' : 'Switch to pan mode'}
            title={isPanMode ? 'Selection mode (V)' : 'Pan mode (H)'}
            data-state={isPanMode ? 'active' : 'inactive'}
          >
            {isPanMode ? (
              <Hand className="size-5" aria-hidden="true" />
            ) : (
              <MousePointer2 className="size-5" aria-hidden="true" />
            )}
          </Button>
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
