import { createFileRoute } from '@tanstack/react-router'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import Flow from '../components/Header'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div
      className="w-full h-full"
    // style={{ height: '100%', width: '100%' }}
    >
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
