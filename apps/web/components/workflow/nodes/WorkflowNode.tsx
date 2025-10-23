'use client'

import {
  BarChart3,
  CheckIcon,
  CircleX,
  Clock,
  CrossIcon,
  FileText,
  GitBranch,
  MessageSquare,
  MoreHorizontal,
  Play,
  PlayCircle,
  Plus,
  Sigma,
  Zap,
} from 'lucide-react'
import {
  NodeTooltip,
  NodeTooltipContent,
  NodeTooltipTrigger,
} from '@/components/react-flow/nodes/node-tooltip'
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeDescription,
} from '@/components/react-flow/nodes/base-node'
import { IconBrandTelegram, IconMail, IconRobotFace, IconWebhook } from '@tabler/icons-react'
import { NodeStatusIndicator } from '@/components/react-flow/nodes/node-status-indicator'
import { ButtonHandle } from '@/components/react-flow/nodes/button-handle'
import { BaseHandle } from '@/components/react-flow/nodes/base-handle'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { NodeProps, NodeToolbar, Position } from '@xyflow/react'
import { NodeData, NodeType } from '@/lib/types/workflow'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { Button } from '@buzz8n/ui/components/button'
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
    // case 'schedule':
    //   return <Clock size={48} />
    // case 'appEvent':
    //   return <Zap size={48} />
    case 'formSubmission':
      return <FileText size={48} />
    // case 'executedByWorkflow':
    //   return <GitBranch size={48} />
    case 'aiAgent':
      return <IconRobotFace size={48} />
    case 'chatMessage':
      return <MessageSquare size={48} />
    // case 'evaluation':
    //   return <BarChart3 size={48} />
    case 'multiply':
      return <CircleX size={38} />
    case 'sum':
      return <Sigma size={38} />
    default:
      return <MoreHorizontal size={48} />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'loading':
      return 'text-yellow-500 '
    case 'success':
      return 'text-green-500 '
    case 'error':
      return 'text-red-500 '
    default:
      return 'bg-gray-500 '
  }
}
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'loading':
      return <Spinner className={`size-4 ${getStatusColor(status)}`} />
    case 'success':
      return <CheckIcon className={`size-4 ${getStatusColor(status)}`} />
    case 'error':
      return <CrossIcon className={`size-4 ${getStatusColor(status)}`} />
    default:
      return <></>
  }
}

const Workflow = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { edges, selectNode, openNodePaletteFor } = useWorkflowEditorStore()

  // const isFirstNode = nodes.length === 1 || nodes[0]?.id === id
  const isFirstNode = data.type === 'manualTrigger' || data.type === 'webhook'

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
        <NodeStatusIndicator status={data.status} variant="border">
          <NodeToolbar
            className="flex flex-col items-center gap-2"
            isVisible={selected && (data.type === 'manualTrigger' || data.type === 'webhook')}
            position={Position.Left}
            align="center"
          >
            <Button variant="ghost" size="icon">
              <PlayCircle className="size-6 text-primary" />
            </Button>
          </NodeToolbar>
          <BaseNode
            onClick={handleClick}
            className={cn(
              'flex flex-col bg-secondary/10 items-center gap-2 p-4 cursor-pointer transition-all duration-200',
              selected && 'ring-2 ring-primary shadow-lg',
              isFirstNode && 'rounded-l-4xl',
              data.type === 'aiAgent' && 'bg-gradient-to-r from-primary to-secondary w-80',
              data.category === 'ai-agent-tools' && 'p-2 rounded-3xl bg-muted-foreground/20',
            )}
          >
            <div
              className={`
              rounded-full text-xs absolute top-2  right-1
            `}
            >
              {data.status && getStatusIcon(data.status)}
            </div>
            <BaseNodeContent className={cn('flex items-center justify-center gap-3 p-6')}>
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
              {
                data.category !== 'ai-agent-tools' &&
                  (!hasOutgoing ? (
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
                      position={Position.Right}
                      className="bg-muted-foreground border-2 border-background"
                    ></BaseHandle>
                  ))
                // : (
                //   <></>
                // )
              }

              {data.type === 'aiAgent' && (
                <>
                  <ButtonHandle
                    id={`${id as string}-add-agent-bottom-left-handle`}
                    type="source"
                    position={Position.Bottom}
                    subGraph
                    className="bg-muted-foreground border-2 border-background -translate-x-10"
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        openNodePaletteFor(id, `${id as string}-add-agent-bottom-left-handle`)
                      }}
                      size="sm"
                      variant="secondary"
                      className="rounded-sm border"
                    >
                      <Plus size={10} />
                    </Button>
                  </ButtonHandle>
                  <ButtonHandle
                    id={`${id as string}-add-agent-bottom-right-handle`}
                    type="source"
                    subGraph
                    position={Position.Bottom}
                    className="bg-muted-foreground border-2 border-background translate-x-10"
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        openNodePaletteFor(id, `${id as string}-add-agent-bottom-right-handle`)
                      }}
                      size="sm"
                      variant="secondary"
                      className="rounded-sm border"
                    >
                      <Plus size={10} />
                    </Button>
                  </ButtonHandle>
                </>
              )}
            </BaseNodeContent>
            <BaseNodeDescription
              className={cn(
                'text-xs font-medium text-center text-foreground text-nowrap -bottom-12',
              )}
            >
              {data.label}
            </BaseNodeDescription>
          </BaseNode>
        </NodeStatusIndicator>
      </NodeTooltipTrigger>
    </NodeTooltip>
  )
}

export const WorkflowNode = memo(Workflow)
