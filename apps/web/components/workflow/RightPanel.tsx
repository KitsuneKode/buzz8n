'use client'

import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { NodePalette } from './NodePalette'
import { PropertiesPanel } from './PropertiesPanel'
import { Button } from '@buzz8n/ui/components/button'
import { X } from 'lucide-react'

export function RightPanel() {
  const { 
    isNodePaletteOpen, 
    selectedNodeId, 
    toggleNodePalette 
  } = useWorkflowEditorStore()

  if (!isNodePaletteOpen && !selectedNodeId) {
    return null
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">
          {selectedNodeId ? 'Node Properties' : 'What happens next?'}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNodePalette}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedNodeId ? (
          <PropertiesPanel />
        ) : (
          <NodePalette />
        )}
      </div>
    </div>
  )
}
