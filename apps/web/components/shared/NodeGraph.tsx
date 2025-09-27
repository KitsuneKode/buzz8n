'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

interface Node {
  id: string
  x: number
  y: number
  label: string
  type: 'input' | 'process' | 'output' | 'ai'
}

interface Connection {
  from: string
  to: string
}

interface NodeGraphProps {
  className?: string
  animated?: boolean
  interactive?: boolean
}

export function NodeGraph({
  className = '',
  animated = false,
  interactive = false,
}: NodeGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const nodes: Node[] = [
    { id: '1', x: 50, y: 100, label: 'Data Input', type: 'input' },
    { id: '2', x: 200, y: 50, label: 'AI Processor', type: 'ai' },
    { id: '3', x: 200, y: 150, label: 'Transform', type: 'process' },
    { id: '4', x: 350, y: 75, label: 'AI Optimizer', type: 'ai' },
    { id: '5', x: 500, y: 100, label: 'Output', type: 'output' },
  ]

  const connections: Connection[] = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '2', to: '4' },
    { from: '3', to: '4' },
    { from: '4', to: '5' },
  ]

  const getNodeColor = (type: Node['type'], isHovered: boolean) => {
    const colors = {
      input: isHovered ? 'oklch(0.594 0.0443 196.0233)' : 'oklch(0.6268 0 0)',
      process: isHovered ? 'oklch(0.683 0 0)' : 'oklch(0.6268 0 0)',
      ai: isHovered ? 'oklch(0.7214 0.1337 49.9802)' : 'oklch(0.6716 0.1368 48.513)',
      output: isHovered ? 'oklch(0.594 0.0443 196.0233)' : 'oklch(0.6268 0 0)',
    }
    return colors[type]
  }

  const getConnectionPath = (from: Node, to: Node) => {
    const dx = to.x - from.x
    const controlX1 = from.x + dx * 0.5
    const controlY1 = from.y
    const controlX2 = to.x - dx * 0.5
    const controlY2 = to.y

    return `M ${from.x + 20} ${from.y + 15} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.x} ${to.y + 15}`
  }

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <svg width="550" height="200" viewBox="0 0 550 200" className="w-full h-auto">
        {/* Connections */}
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.6716 0.1368 48.513)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.7214 0.1337 49.9802)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {connections.map((connection, index) => {
          const fromNode = nodes.find((n) => n.id === connection.from)!
          const toNode = nodes.find((n) => n.id === connection.to)!

          return (
            <motion.path
              key={`${connection.from}-${connection.to}`}
              d={getConnectionPath(fromNode, toNode)}
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.5,
                delay: animated ? index * 0.2 : 0,
                ease: 'easeInOut',
              }}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node, index) => (
          <g key={node.id}>
            <motion.rect
              x={node.x}
              y={node.y}
              width="40"
              height="30"
              rx="6"
              fill={getNodeColor(node.type, hoveredNode === node.id)}
              className={interactive ? 'cursor-pointer' : ''}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: animated ? index * 0.1 : 0,
                type: 'spring',
                stiffness: 200,
              }}
              whileHover={
                interactive
                  ? {
                      scale: 1.05,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    }
                  : {}
              }
              onMouseEnter={() => interactive && setHoveredNode(node.id)}
              onMouseLeave={() => interactive && setHoveredNode(null)}
            />

            {/* AI indicator for AI nodes */}
            {node.type === 'ai' && (
              <motion.circle
                cx={node.x + 32}
                cy={node.y + 8}
                r="3"
                fill="oklch(1 0 0)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: animated ? index * 0.15 + 0.5 : 0,
                }}
              />
            )}

            {/* Node label */}
            <motion.text
              x={node.x + 20}
              y={node.y + 45}
              textAnchor="middle"
              className="text-xs fill-muted-foreground font-mono"
              style={{ fontSize: '10px' }}
              initial={{ opacity: 0, y: node.y + 50 }}
              animate={{ opacity: 1, y: node.y + 45 }}
              transition={{
                duration: 0.3,
                delay: animated ? index * 0.1 + 0.3 : 0,
              }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </motion.div>
  )
}
