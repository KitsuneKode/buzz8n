import { memo } from 'react'

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeDescription,
} from '@/components/react-flow/nodes/base-node'
import { NodeStatusIndicator } from '@/components/react-flow/nodes/node-status-indicator'
import { NodeTooltip, NodeTooltipContent, NodeTooltipTrigger } from './node-tooltip'
import { type NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Button } from '@buzz8n/ui/components/button'
import { IconWebhook } from '@tabler/icons-react'
import { ButtonHandle } from './button-handle'
import { Plus } from 'lucide-react'

const WebhookNode = ({ id, data }: NodeProps) => {
  const { addNodes } = useReactFlow()
  return (
    <NodeTooltip>
      <NodeTooltipContent position={Position.Top} className="text-white">
        {data?.toolTipDescription as string}
      </NodeTooltipContent>
      <NodeTooltipTrigger>
        <NodeStatusIndicator status="initial" variant="border">
          <BaseNode className="flex flex-col items-center gap-2 p-4">
            <BaseNodeContent className={`flex items-center justify-center w-16 h-16`}>
              <ButtonHandle
                id={id as string}
                type="source"
                position={Position.Right}
                className="p-1"
              >
                <Button
                  onClick={() => {
                    addNodes({
                      id: '6',
                      type: 'telegramGetChat',
                      position: {
                        x: 100,
                        y: 100,
                      },
                      data: {
                        label: 'Webhook',
                      },
                    })
                  }}
                  size="sm"
                  variant="secondary"
                  className="rounded-sm border"
                >
                  <Plus size={10} />
                </Button>
              </ButtonHandle>
              <IconWebhook size={48} />
            </BaseNodeContent>
            <BaseNodeDescription>{data?.label as string}</BaseNodeDescription>
          </BaseNode>
        </NodeStatusIndicator>
      </NodeTooltipTrigger>
    </NodeTooltip>
  )
}

export default memo(WebhookNode)
