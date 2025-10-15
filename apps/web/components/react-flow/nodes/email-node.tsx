import { memo } from 'react'

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeDescription,
} from '@/components/react-flow/nodes/base-node'
import { NodeStatusIndicator } from '@/components/react-flow/nodes/node-status-indicator'
import { NodeTooltip, NodeTooltipContent, NodeTooltipTrigger } from './node-tooltip'
import { type NodeProps, Position } from '@xyflow/react'
import { IconMail } from '@tabler/icons-react'
import { BaseHandle } from './base-handle'

const EmailNode = ({ id, data }: NodeProps) => {
  return (
    <NodeTooltip>
      <NodeTooltipContent position={Position.Top} className="text-white">
        {data?.toolTipDescription as string}
      </NodeTooltipContent>
      <NodeTooltipTrigger>
        <NodeStatusIndicator status="initial" variant="border">
          <BaseNode className="flex flex-col items-center gap-2 p-4">
            <BaseNodeContent className={`flex items-center justify-center w-16 h-16`}>
              <BaseHandle
                id={id as string}
                type="target"
                position={Position.Left}
                className="p-1"
              />
              <IconMail size={48} />
              <BaseHandle
                id={`${id as string}-out`}
                type="source"
                position={Position.Right}
                className="p-1"
              />
            </BaseNodeContent>
            <BaseNodeDescription>{data?.label as string}</BaseNodeDescription>
          </BaseNode>
        </NodeStatusIndicator>
      </NodeTooltipTrigger>
    </NodeTooltip>
  )
}

export default memo(EmailNode)
