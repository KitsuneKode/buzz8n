'use client'
import { useConnection } from '@xyflow/react'
import React from 'react'

const CustomConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
}: {
  fromX: number
  fromY: number
  toX: number
  toY: number
}) => {
  const { fromHandle } = useConnection()

  return (
    <g>
      <path
        fill="none"
        stroke={fromHandle!.id as string}
        strokeWidth={1.5}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke={fromHandle!.id as string}
        strokeWidth={1.5}
      />
    </g>
  )
}
export default CustomConnectionLine
