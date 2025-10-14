'use client'

import {
  BarChart3,
  Clock,
  FileText,
  GitBranch,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Zap,
} from 'lucide-react'
import {
  NodeTooltip,
  NodeTooltipContent,
  NodeTooltipTrigger,
} from '@/components/nodes/node-tooltip'
import { BaseNode, BaseNodeContent, BaseNodeDescription } from '@/components/nodes/base-node'
import { IconBrandTelegram, IconMail, IconRobotFace, IconWebhook } from '@tabler/icons-react'
import { NodeStatusIndicator } from '@/components/nodes/node-status-indicator'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { ButtonHandle } from '@/components/nodes/button-handle'
import { BaseHandle } from '@/components/nodes/base-handle'
import { NodeData, NodeType } from '@/lib/types/workflow'
import { Button } from '@buzz8n/ui/components/button'
import { NodeProps, Position } from '@xyflow/react'
import { cn } from '@buzz8n/ui/lib/utils'
import { memo } from 'react'

const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'manualTrigger':
      return <Play size={48} />
    case 'telegramSendMessage':
      return <IconBrandTelegram size={48} />
    case 'emailSend':
      return <IconMail size={48} />
    case 'webhook':
      return <IconWebhook size={48} />
    case 'schedule':
      return <Clock size={48} />
    case 'appEvent':
      return <Zap size={48} />
    case 'formSubmission':
      return <FileText size={48} />
    case 'executedByWorkflow':
      return <GitBranch size={48} />
    case 'aiAgent':
      return <IconRobotFace size={48} />
    case 'chatMessage':
      return <MessageSquare size={48} />
    case 'evaluation':
      return <BarChart3 size={48} />
    default:
      return <MoreHorizontal size={48} />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'bg-yellow-500 '
    case 'success':
      return 'bg-green-500 '
    case 'failed':
      return 'bg-red-500 '
    case 'queued':
      return 'bg-blue-500 '
    default:
      return 'bg-gray-500 '
  }
}

const Workflow = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { edges, nodes, selectNode, openNodePaletteFor } = useWorkflowEditorStore()

  const isFirstNode = nodes.length === 1 || nodes[0]?.id === id
  const hasOutgoing = edges.some(
    (e) =>
      e.source === id &&
      !(`${e.sourceHandle}` as string).includes(`${id as string}-add-agent-bottom-handle`),
  )

  const handleClick = () => {
    selectNode(id)
  }

  return (
    <NodeTooltip>
      <NodeTooltipContent position={Position.Top} className="text-white">
        {data?.description}
      </NodeTooltipContent>
      <NodeTooltipTrigger>
        <NodeStatusIndicator status={data.status || 'initial'} variant="border">
          <BaseNode
            onClick={handleClick}
            className={cn(
              'flex flex-col items-center gap-2 p-4 cursor-pointer transition-all duration-200',
              selected && 'ring-2 ring-primary shadow-lg',
              isFirstNode && 'rounded-l-4xl',
              data.type === 'aiAgent' && 'bg-gradient-to-r from-primary to-secondary w-80',
            )}
          >
            <div
              className={`
              rounded-full p-1 text-xs absolute text-black top-2 right-2
              ${getStatusColor(data.status || 'initial')}
            `}
            >
              {data.status}
            </div>
            <BaseNodeContent
              className={cn(
                'flex items-center justify-center gap-3 p-6',
                !data.credentials && 'ring-2 rounded-xl ring-red-500',
              )}
            >
              {/* Input Handle */}
              {!isFirstNode && (
                <BaseHandle
                  type="target"
                  position={Position.Left}
                  className=" bg-muted-foreground border-2 border-background"
                />
              )}

              {/* Node Icon */}
              {getNodeIcon(data.type)}

              {/* Output Handle */}
              {!hasOutgoing ? (
                <ButtonHandle
                  type="source"
                  position={Position.Right}
                  className="bg-muted-foreground border-2 border-background"
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      openNodePaletteFor(id)
                    }}
                    size="sm"
                    variant="secondary"
                    className="rounded-sm border"
                  >
                    <Plus size={10} />
                  </Button>
                </ButtonHandle>
              ) : (
                <BaseHandle
                  type="source"
                  position={Position.Right || Position.Bottom}
                  className="bg-muted-foreground border-2 border-background"
                ></BaseHandle>
              )}

              {data.type === 'aiAgent' && (
                <ButtonHandle
                  id={`${id as string}-add-agent-bottom-handle`}
                  type="source"
                  position={Position.Bottom}
                  className="bg-muted-foreground border-2 border-background"
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      openNodePaletteFor(id, `${id as string}-add-agent-bottom-handle`)
                    }}
                    size="sm"
                    variant="secondary"
                    className="rounded-sm border"
                  >
                    <Plus size={10} />
                  </Button>
                </ButtonHandle>
              )}
            </BaseNodeContent>
            <BaseNodeDescription className="text-xs font-medium text-center text-foreground text-nowrap -bottom-12">
              {data.label}
            </BaseNodeDescription>
          </BaseNode>
        </NodeStatusIndicator>
      </NodeTooltipTrigger>
    </NodeTooltip>
  )
}

export const WorkflowNode = memo(Workflow)
