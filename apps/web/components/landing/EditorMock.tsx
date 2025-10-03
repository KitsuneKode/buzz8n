'use client'

import { Play, Pause, RotateCcw, Settings, Eye } from 'lucide-react'
import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@buzz8n/ui/components/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@buzz8n/ui/components/tooltip'
import { Button } from '@buzz8n/ui/components/button'
import { cn } from '@buzz8n/ui/lib/utils'

interface NodeData {
  id: string
  label: string
  type: 'trigger' | 'agent' | 'tool' | 'branch' | 'output'
  status: 'idle' | 'running' | 'success' | 'failed'
  x: number
  y: number
}

const mockNodes: NodeData[] = [
  { id: '1', label: 'Webhook Trigger', type: 'trigger', status: 'success', x: 50, y: 100 },
  { id: '2', label: 'GPT-4 Agent', type: 'agent', status: 'success', x: 250, y: 100 },
  { id: '3', label: 'Search Tool', type: 'tool', status: 'running', x: 450, y: 60 },
  { id: '4', label: 'Decision Branch', type: 'branch', status: 'idle', x: 450, y: 140 },
  { id: '5', label: 'Slack Output', type: 'output', status: 'idle', x: 650, y: 100 },
]

const connections = [
  { from: '1', to: '2' },
  { from: '2', to: '3' },
  { from: '2', to: '4' },
  { from: '3', to: '5' },
  { from: '4', to: '5' },
]

function getStatusColor(status: NodeData['status']) {
  switch (status) {
    case 'success':
      return 'bg-green-400'
    case 'running':
      return 'bg-cyan-400 animate-pulse'
    case 'failed':
      return 'bg-rose-400'
    default:
      return 'bg-slate-400'
  }
}

function getNodeColor(type: NodeData['type']) {
  switch (type) {
    case 'trigger':
      return 'border-green-400/50 bg-green-400/10'
    case 'agent':
      return 'border-cyan-400/50 bg-cyan-400/10'
    case 'tool':
      return 'border-yellow-400/50 bg-yellow-400/10'
    case 'branch':
      return 'border-purple-400/50 bg-purple-400/10'
    case 'output':
      return 'border-blue-400/50 bg-blue-400/10'
    default:
      return 'border-slate-400/50 bg-slate-400/10'
  }
}

function Node({ node }: { node: NodeData }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-32 h-16 rounded-lg border-2 flex items-center justify-center text-xs font-medium text-slate-100 cursor-pointer transition-all hover:scale-105',
              getNodeColor(node.type),
            )}
            style={{ left: node.x, top: node.y }}
          >
            <div className="flex items-center space-x-2">
              <div className={cn('w-2 h-2 rounded-full', getStatusColor(node.status))} />
              <span className="truncate">{node.label}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">{node.label}</div>
            <div className="text-slate-400 capitalize">
              {node.type} • {node.status}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function Connection({ from, to }: { from: string; to: string }) {
  const fromNode = mockNodes.find((n) => n.id === from)
  const toNode = mockNodes.find((n) => n.id === to)

  if (!fromNode || !toNode) return null

  const startX = fromNode.x + 128 // node width
  const startY = fromNode.y + 32 // node height / 2
  const endX = toNode.x
  const endY = toNode.y + 32

  const midX = (startX + endX) / 2

  return (
    <svg className="absolute inset-0 pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="rgb(148 163 184)" />
        </marker>
      </defs>
      <path
        d={`M ${startX} ${startY} Q ${midX} ${startY} ${endX} ${endY}`}
        stroke="rgb(148 163 184)"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="animate-pulse"
        strokeDasharray="5,5"
        style={{
          animation: 'dash 2s linear infinite',
        }}
      />
    </svg>
  )
}

interface EditorMockProps {
  showToolbar?: boolean
  className?: string
}

export function EditorMock({ showToolbar = true, className }: EditorMockProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [showLogs, setShowLogs] = React.useState(false)

  const handleRun = () => {
    setIsRunning(!isRunning)
  }

  return (
    <div
      className={cn(
        'relative bg-slate-900 rounded-lg border border-white/10 overflow-hidden',
        className,
      )}
    >
      {showToolbar && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={isRunning ? 'destructive' : 'default'}
              onClick={handleRun}
              className="h-8"
            >
              {isRunning ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showLogs} onOpenChange={setShowLogs}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8">
                  <Eye className="h-3 w-3 mr-1" />
                  Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Execution Logs</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-green-400">[12:34:56] Webhook triggered successfully</div>
                  <div className="text-cyan-400">[12:34:57] GPT-4 Agent processing request...</div>
                  <div className="text-yellow-400">[12:34:58] Search Tool executing query</div>
                  <div className="text-slate-400">[12:34:59] Waiting for decision branch...</div>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" className="h-8">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      )}

      <div className="relative h-64 p-4">
        {/* Connections */}
        {connections.map((conn, index) => (
          <Connection key={index} from={conn.from} to={conn.to} />
        ))}

        {/* Nodes */}
        {mockNodes.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  )
}
