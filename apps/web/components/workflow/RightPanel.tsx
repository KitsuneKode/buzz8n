'use client'

import { Dialog, DialogContent, DialogTitle } from '@buzz8n/ui/components/dialog'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Button } from '@buzz8n/ui/components/button'
import { PropertiesPanel } from './PropertiesPanel'
import { NodePalette } from './NodePalette'
import { X } from 'lucide-react'

/**
 * Render the workflow editor's right-side panel containing either the node palette or the properties panel.
 *
 * The panel is not rendered (returns `null`) when the node palette is closed and no node is selected.
 * Header text adapts to current editor state (showing palette, selected node, and handle context).
 *
 * @returns The right-side panel element, or `null` when the panel is hidden.
 */
export function RightPanel() {
  const { isNodePaletteOpen, selectedNodeId, closeRightPanel, nodes, handleId } =
    useWorkflowEditorStore()
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)
  if (!isNodePaletteOpen && !selectedNode) {
    return null
  }

  const showingPalette = isNodePaletteOpen
  const showingProperties = !showingPalette && selectedNode

  // Render properties panel as a centered modal/dialog
  if (showingProperties) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && closeRightPanel()}>
        <DialogTitle className="sr-only">Configure node settings</DialogTitle>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{selectedNode.data.label}</h3>
              <span className="text-xs text-muted-foreground">Configure node settings</span>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <PropertiesPanel />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Render node palette as sidebar (existing behavior)
  return (
    <div className="w-90 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
          {handleId && selectedNode && `Add Tools to your Agent`}
          {!handleId && !selectedNode && `What happens next?`}
          {!handleId && selectedNode && `Add node to ${selectedNode?.data.label}`}
        </h3>
        <Button variant="ghost" size="icon" onClick={closeRightPanel} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <NodePalette />
      </div>
    </div>
  )
}
