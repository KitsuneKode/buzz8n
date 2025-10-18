import { EdgeProps, useReactFlow } from '@xyflow/react'
import { memo } from 'react'

import { ButtonEdge } from '@/components/react-flow/button-edge'
import { Button } from '@buzz8n/ui/components/button'
import { X } from 'lucide-react'

const DeleteButtonEdge = (props: EdgeProps) => {
  const { setEdges } = useReactFlow()
  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== props.id))
  }
  return (
    <ButtonEdge {...props}>
      <Button
        onClick={onEdgeClick}
        size="icon"
        variant="outline"
        className="hover:text-red-600 bg-foreground/20"
      >
        <X size={14} />
      </Button>
    </ButtonEdge>
  )
}

export default memo(DeleteButtonEdge)
