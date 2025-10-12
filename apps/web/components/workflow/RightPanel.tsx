'use client'

import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Button } from '@buzz8n/ui/components/button'
import { PropertiesPanel } from './PropertiesPanel'
import { NodePalette } from './NodePalette'
import { X } from 'lucide-react'

export function RightPanel() {
  const { isNodePaletteOpen, selectedNodeId, closeRightPanel, nodes } = useWorkflowEditorStore()
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)
  if (!isNodePaletteOpen && !selectedNode) {
    return null
  }
  const showingPalette = isNodePaletteOpen

  return (
    <div className="w-90 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">
          {showingPalette ? 'What happens next?' : 'Node Properties'}
        </h3>
        <Button variant="ghost" size="icon" onClick={closeRightPanel} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showingPalette ? <NodePalette /> : <PropertiesPanel />}
      </div>
    </div>
  )
}
