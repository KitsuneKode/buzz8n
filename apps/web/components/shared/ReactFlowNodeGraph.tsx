'use client'

import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
} from '@xyflow/react'
import { Brain, Database, Globe, MessageSquare, Zap, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import '@xyflow/react/dist/style.css'

interface ReactFlowNodeGraphProps {
  className?: string
  animated?: boolean
  interactive?: boolean
  showControls?: boolean
  height?: string
}

// Custom Node Component
interface NodeData {
  label: string
  type: 'input' | 'ai' | 'process' | 'output'
  description?: string
}

const AINode = ({ data, selected }: { data: NodeData; selected: boolean }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'input':
        return <Database className="w-4 h-4" />
      case 'ai':
        return <Brain className="w-4 h-4" />
      case 'process':
        return <MessageSquare className="w-4 h-4" />
      case 'output':
        return <Globe className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getNodeColor = () => {
    switch (data.type) {
      case 'input':
        return 'oklch(0.594 0.0443 196.0233)'
      case 'ai':
        return 'oklch(0.7214 0.1337 49.9802)'
      case 'process':
        return 'oklch(0.683 0 0)'
      case 'output':
        return 'oklch(0.594 0.0443 196.0233)'
      default:
        return 'oklch(0.6268 0 0)'
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      className={`relative px-4 py-3 rounded-lg border-2 bg-card/90 backdrop-blur-sm transition-all duration-200 ${
        selected
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border hover:border-primary/40'
      }`}
      style={{
        minWidth: '120px',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />

      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-md text-white" style={{ backgroundColor: getNodeColor() }}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground">{data.description}</div>
          )}
        </div>

        {data.type === 'ai' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-3 h-3 text-primary" />
          </motion.div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
    </motion.div>
  )
}

const nodeTypes: NodeTypes = {
  aiNode: AINode,
}

export function ReactFlowNodeGraph({
  className = '',
  animated = false,
  interactive = false,
  showControls = false,
  height = '300px',
}: ReactFlowNodeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [isReady, setIsReady] = useState(false)

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'aiNode',
      position: { x: 50, y: 100 },
      data: {
        label: 'Data Input',
        type: 'input',
        description: 'API endpoint',
      },
    },
    {
      id: '2',
      type: 'aiNode',
      position: { x: 250, y: 50 },
      data: {
        label: 'AI Processor',
        type: 'ai',
        description: 'LLM analysis',
      },
    },
    {
      id: '3',
      type: 'aiNode',
      position: { x: 250, y: 150 },
      data: {
        label: 'Transform',
        type: 'process',
        description: 'Data processing',
      },
    },
    {
      id: '4',
      type: 'aiNode',
      position: { x: 450, y: 75 },
      data: {
        label: 'AI Optimizer',
        type: 'ai',
        description: 'Smart optimization',
      },
    },
    {
      id: '5',
      type: 'aiNode',
      position: { x: 650, y: 100 },
      data: {
        label: 'Output',
        type: 'output',
        description: 'Webhook delivery',
      },
    },
  ]

  const initialEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      animated: animated,
      style: {
        stroke: 'oklch(0.7214 0.1337 49.9802)',
        strokeWidth: 2,
      },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'smoothstep',
      animated: animated,
      style: {
        stroke: 'oklch(0.594 0.0443 196.0233)',
        strokeWidth: 2,
      },
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      type: 'smoothstep',
      animated: animated,
      style: {
        stroke: 'oklch(0.7214 0.1337 49.9802)',
        strokeWidth: 2,
      },
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      type: 'smoothstep',
      animated: animated,
      style: {
        stroke: 'oklch(0.594 0.0443 196.0233)',
        strokeWidth: 2,
      },
    },
    {
      id: 'e4-5',
      source: '4',
      target: '5',
      type: 'smoothstep',
      animated: animated,
      style: {
        stroke: 'oklch(0.7214 0.1337 49.9802)',
        strokeWidth: 2,
      },
    },
  ]

  useEffect(() => {
    // Animate nodes appearing one by one
    if (animated) {
      initialNodes.forEach((node, index) => {
        setTimeout(() => {
          setNodes((prev) => [...prev, node])
        }, index * 200)
      })

      // Add edges after nodes are loaded
      setTimeout(
        () => {
          setEdges(initialEdges)
        },
        initialNodes.length * 200 + 500,
      )
    } else {
      setNodes(initialNodes)
      setEdges(initialEdges)
    }

    setIsReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated])

  const onConnect = useCallback(
    (params: Connection) => {
      if (interactive) {
        const newEdge = {
          ...params,
          type: 'smoothstep',
          animated: true,
        } as Edge
        setEdges((eds) => addEdge(newEdge, eds))
      }
    },
    [interactive, setEdges],
  )

  if (!isReady) {
    return (
      <div className={`relative ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative ${className}`}
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
        panOnDrag={interactive}
        zoomOnScroll={interactive}
        zoomOnPinch={interactive}
        zoomOnDoubleClick={interactive}
        className="bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="oklch(0.252 0 0)" />
        {showControls && interactive && (
          <Controls className=" dark:text-black dark:border rounded-xl" showInteractive={false} />
        )}
      </ReactFlow>

      {/* AI Insights Overlay - Smaller and more subtle */}
      {animated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-2 right-2 bg-primary/5 backdrop-blur-sm border border-primary/10 rounded-md p-2 max-w-48"
        >
          <div className="flex items-center space-x-1 mb-1">
            <Sparkles className="w-2 h-2 text-primary" />
            <span className="text-[10px] font-medium text-foreground">AI Optimized</span>
          </div>
          <p className="text-[9px] text-muted-foreground leading-tight">
            +40% performance boost detected
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
