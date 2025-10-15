import { BaseEdge, EdgeProps, Position, getBezierPath } from '@xyflow/react'

export default function CoolEdge({
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

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Right,
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Left,
  })

  // // Custom styling options
  // const customStyle = {
  //   stroke: '#64748b', // Change color here
  //   strokeWidth: 2, // Change thickness here
  //   strokeDasharray: undefined, // Remove this line or set to '5,5' for dashed
  //   ...style,
  // }

  return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
}
