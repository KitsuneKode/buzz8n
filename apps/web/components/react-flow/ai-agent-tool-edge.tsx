import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Position,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react'
import { Button } from '@buzz8n/ui/components/button'
import { X } from 'lucide-react'

export default function AiAgentToolEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  // You can change this to 'straight', 'bezier', or 'smoothstep'
  // Or pass it dynamically through edge data: data?.edgeType
  // const edgeType: EdgeType = 'smoothstep' // Change this value to switch edge types

  const { setEdges } = useReactFlow()
  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id))
  }
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Right,
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Left,
  })

  // // Custom styling options
  const customStyle = {
    stroke: '#64748b', // Change color here
    strokeWidth: 2, // Change thickness here
    strokeDasharray: '5,5', // Remove this line or set to '5,5' for dashed
    ...style,
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={customStyle} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
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
