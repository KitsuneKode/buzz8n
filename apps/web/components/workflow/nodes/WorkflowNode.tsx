'use client'

import {
  Play,
  MessageCircle,
  Mail,
  Webhook,
  Clock,
  Zap,
  FileText,
  GitBranch,
  MessageSquare,
  BarChart3,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { BaseNode, BaseNodeContent, BaseNodeDescription } from '@/components/nodes/base-node'
import { NodeStatusIndicator } from '@/components/nodes/node-status-indicator'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { NodeData, NodeType } from '@/lib/types/workflow'
import { IconBrandTelegram } from '@tabler/icons-react'
import { Button } from '@buzz8n/ui/components/button'
import { memo } from 'react'

const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'manualTrigger':
      return <Play className="w-8 h-8" />
    case 'telegramGetChat':
      return <IconBrandTelegram size={32} />
    case 'emailSend':
      return <Mail className="w-8 h-8" />
    case 'webhook':
      return <Webhook className="w-8 h-8" />
    case 'schedule':
      return <Clock className="w-8 h-8" />
    case 'appEvent':
      return <Zap className="w-8 h-8" />
    case 'formSubmission':
      return <FileText className="w-8 h-8" />
    case 'executedByWorkflow':
      return <GitBranch className="w-8 h-8" />
    case 'chatMessage':
      return <MessageSquare className="w-8 h-8" />
    case 'evaluation':
      return <BarChart3 className="w-8 h-8" />
    default:
      return <MoreHorizontal className="w-8 h-8" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'border-yellow-500 bg-yellow-50'
    case 'success':
      return 'border-green-500 bg-green-50'
    case 'failed':
      return 'border-red-500 bg-red-50'
    case 'queued':
      return 'border-blue-500 bg-blue-50'
    default:
      return 'border-border bg-card'
  }
}

export const WorkflowNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const { selectNode } = useWorkflowEditorStore()

  const handleClick = () => {
    selectNode(data.id)
  }

  return (
    <div onClick={handleClick}>
      <NodeStatusIndicator status={data.status || 'initial'} variant="border">
        <BaseNode
          className={`
          min-w-[120px] cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-primary shadow-lg' : ''}
          ${getStatusColor(data.status || 'idle')}
        `}
        >
          <BaseNodeContent className="flex flex-col items-center gap-3 p-4 relative">
            {/* Input Handle */}
            {data.type !== 'manualTrigger' && (
              <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-muted-foreground border-2 border-background"
              />
            )}

            {/* Node Icon */}
            <div className="flex items-center justify-center text-muted-foreground">
              {getNodeIcon(data.type)}
            </div>

            {/* Node Label */}
            <BaseNodeDescription className="static text-xs font-medium text-center text-foreground">
              {data.label}
            </BaseNodeDescription>

            {/* Status indicator for manual trigger */}
            {data.type === 'manualTrigger' && (
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}

            {/* Output Handle */}
            <Handle
              type="source"
              position={Position.Right}
              className="w-3 h-3 bg-muted-foreground border-2 border-background"
            />

            {/* Add button handle for connecting */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </div>
  )
})
