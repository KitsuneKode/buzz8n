import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  MarkerType,
  Position,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react'
import { Button } from '@buzz8n/ui/components/button'
import { X } from 'lucide-react'
import { memo } from 'react'

const AiAgentToolEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) => {
  const { setEdges } = useReactFlow()
  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id))
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition ?? Position.Right,
    targetX,
    targetY,
    targetPosition: targetPosition ?? Position.Left,
  })

  const customStyle = {
    stroke: '#64748b',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    ...style,
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={customStyle} markerEnd={MarkerType.Arrow} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            pointerEvents: 'all',
            zIndex: 10,
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <Button
            onClick={onEdgeClick}
            size="icon"
            variant="ghost"
            className="hover:text-red-600 bg-foreground/20"
          >
            <X size={12} />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(AiAgentToolEdge)
