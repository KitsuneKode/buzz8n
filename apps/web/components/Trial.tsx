'use client'
import {
  Background,
  Panel,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type FitViewOptions,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodeDrag,
  type OnNodesChange,
} from '@xyflow/react'
import { Fullscreen, Minus, Plus } from 'lucide-react'
import { Button } from '@buzz8n/ui/components/button'
import telegramNode from './nodes/telegram-node'
import webhookNode from './nodes/webhook-node'
import { useCallback, useState } from 'react'
import emailNode from './nodes/email-node'
import CoolEdge from './nodes/cool-edge'
import '@xyflow/react/dist/style.css'

const initialNodes: Node[] = [
  {
    id: '2',
    data: { label: 'Telegram', toolTipDescription: 'Send a message on Telegram' },
    type: 'telegram',
    position: { x: 500, y: 200 },
  },
  {
    id: '3',
    data: { label: 'Email', toolTipDescription: 'Send an Email' },
    type: 'email',
    position: { x: 500, y: -200 },
  },
  {
    id: '1',
    data: { label: 'Trigger', toolTipDescription: 'Start a Trigger' },
    type: 'webhook',
    position: { x: 0, y: 10 },
  },
]

const initialEdges: Edge[] = [{ id: 'xy-edge__1-2', source: '1', target: '2', type: 'cool-edge' }]

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  markerEnd: 'ArrowClosed',
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
  },
}

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node.data)
}

export function Flow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)

  const nodeTypes = {
    telegram: telegramNode,
    email: emailNode,
    webhook: webhookNode,
  }

  const edgeTypes = {
    'cool-edge': CoolEdge,
  }

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    [setEdges],
  )
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )
  const { fitView, zoomIn, zoomOut, addNodes } = useReactFlow()

  const onFitView = useCallback(() => {
    fitView({ padding: 0.2 })
  }, [fitView])

  return (
    <ReactFlow
      colorMode={'dark'}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDrag={onNodeDrag}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Button
        className="absolute top-2 right-2 z-2000"
        onClick={() =>
          addNodes({
            id: '6',
            data: { label: 'Trigger', toolTipDescription: 'Start a Trigger' },
            type: 'webhook',
            position: { x: 100, y: 100 },
          })
        }
      >
        Add Node
      </Button>
      <Background />
      {edges.map((edge) => JSON.stringify(edge))}
      <Panel
        position="bottom-left"
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
    </ReactFlow>
  )
}
