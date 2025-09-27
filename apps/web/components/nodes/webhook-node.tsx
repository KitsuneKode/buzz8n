import { memo } from 'react'

import { BaseNode, BaseNodeContent, BaseNodeDescription } from '@/components/nodes/base-node'
import { NodeTooltip, NodeTooltipContent, NodeTooltipTrigger } from './node-tooltip'
import { NodeStatusIndicator } from '@/components/nodes/node-status-indicator'
import { type NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Button } from '@buzz8n/ui/components/button'
import { IconWebhook } from '@tabler/icons-react'
import { ButtonHandle } from './button-handle'
import { Plus } from 'lucide-react'

const WebhookNode = ({ data }: NodeProps) => {
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
                id={data.id as string}
                type="source"
                position={Position.Right}
                className="p-1"
              >
                <Button
                  onClick={() => {
                    addNodes({
                      id: '6',

                      type: 'telegram',
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
