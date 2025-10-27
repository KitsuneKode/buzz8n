'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@buzz8n/ui/components/select'
import { NodeExecutionDetailDialog } from './NodeExecutionDetailDialog'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { Textarea } from '@buzz8n/ui/components/textarea'
import { getDefaultConfig } from '@/utils/node-templates'
import { AlertCircle, Trash2, Eye } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard'
import { Button } from '@buzz8n/ui/components/button'
import { Label } from '@buzz8n/ui/components/label'
import { Badge } from '@buzz8n/ui/components/badge'
import { ConfigRenderer } from './ConfigRenderer'
import { useState } from 'react'
import React from 'react'

/**
 * Renders the properties panel for the currently selected workflow node.
 *
 * The panel reads node and credential state from the editor and dashboard stores and lets the user
 * modify the selected node's configuration, select or create credentials, update common node settings,
 * add notes, or delete the node. If no node is selected, it renders a "No node selected" placeholder.
 *
 * @returns The rendered properties panel for the currently selected node
 */
export function PropertiesPanel() {
  const {
    nodes,
    selectedNodeId,
    updateSelectedNodeConfig,
    setSelectedNodeCredentialRef,
    deleteNode,
    currentExecution,
    getNodeExecutionLog,
  } = useWorkflowEditorStore()
  const { credentials, openCredentialModal } = useDashboardStore()
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  if (!selectedNode) {
    return <div className="p-4 text-center text-muted-foreground">No node selected</div>
  }
  const nodeConfig = selectedNode.data.config || {}

  const requiredCredentials = selectedNode.data.requiredCredentials || []

  const handleConfigChange = (key: string, value: string | unknown) => {
    updateSelectedNodeConfig({ [key]: value })
  }

  const handleDeleteNode = () => {
    if (!selectedNodeId) return
    deleteNode(selectedNodeId)
  }

  const handleViewExecutionOutput = () => {
    setIsExecutionDialogOpen(true)
  }

  // Check if we can show the execution output button
  const canViewExecutionOutput =
    currentExecution && selectedNodeId && getNodeExecutionLog(selectedNodeId) !== null

  // const handleSave = () => {
  //   if (!selectedNodeId) return
  //   // Save logic here
  // }

  return (
    <div className="flex flex-col h-full ">
      {/* Node Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{selectedNode.data.label}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteNode}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedNode.data.type}
        </Badge>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-y-auto px-2 z-50 space-y-6">
        {/* Credentials Section */}

        {requiredCredentials.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Credential to connect with
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={selectedNode.data.credentials?.id || ''}
              onValueChange={(id) => {
                // console.log(id)
                if (id === 'create-new') {
                  setSelectedNodeCredentialRef(null)
                  openCredentialModal()
                  return
                } // handled elsewhere
                const cred = credentials.find((c) => c.id === id)
                if (cred) {
                  setSelectedNodeCredentialRef({
                    id: cred.id,
                    name: cred.name,
                    provider: cred.provider,
                  })
                }
              }}
            >
              <SelectTrigger className={!selectedNode.data.credentials?.id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a credential" />
              </SelectTrigger>
              <SelectContent>
                {credentials
                  .filter((cred) =>
                    requiredCredentials.length === 0
                      ? true
                      : requiredCredentials.includes(String(cred.provider).toLowerCase()),
                  )
                  .map((cred) => (
                    <SelectItem key={cred.id} value={cred.id}>
                      {cred.name}
                    </SelectItem>
                  ))}
                <SelectItem value="create-new">+ Create new credential</SelectItem>
              </SelectContent>
            </Select>
            {!selectedNode.data.credentials?.id && (
              <p className="text-xs text-red-500">Credential selection is required</p>
            )}
            {credentials.filter((cred) =>
              requiredCredentials.length === 0
                ? true
                : requiredCredentials.includes(String(cred.provider).toLowerCase()),
            ).length === 0 && (
              <div className="flex items-center space-x-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>No {requiredCredentials[0]} credentials found</span>
              </div>
            )}
          </div>
        )}

        {/* Node-specific Configuration */}
        <ConfigRenderer
          config={nodeConfig}
          selectedCredential={selectedNode.data.credentials}
          onConfigChange={handleConfigChange}
          defaultConfig={getDefaultConfig(selectedNode.data.type)}
          nodeType={selectedNode.data.type}
          nodeId={selectedNode.id}
        />

        {/* Common Settings */}
        {/* <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Continue on Fail</Label>
              <p className="text-xs text-muted-foreground">
                Continue workflow execution even if this node fails
              </p>
            </div>
            <Switch
              checked={nodeConfig.continueOnFail || false}
              onCheckedChange={(checked) => handleConfigChange('continueOnFail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Always Output Data</Label>
              <p className="text-xs text-muted-foreground">
                Output data even when the node returns no data
              </p>
            </div>
            <Switch
              checked={nodeConfig.alwaysOutputData || false}
              onCheckedChange={(checked) => handleConfigChange('alwaysOutputData', checked)}
            />
          </div>
        </div> */}

        {/* Node Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about this node..."
            rows={3}
            value={nodeConfig.notes ? nodeConfig.notes : ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleConfigChange('notes', e.target.value)
            }
          />
        </div>
      </div>

      {/* Footer Actions */}
      {canViewExecutionOutput && (
        <div className="p-4 border-t border-border">
          <Button onClick={handleViewExecutionOutput} className="w-full" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Execution Output
          </Button>
        </div>
      )}

      {/* Node Execution Detail Dialog */}
      <NodeExecutionDetailDialog
        open={isExecutionDialogOpen}
        onOpenChange={setIsExecutionDialogOpen}
        log={selectedNodeId ? getNodeExecutionLog(selectedNodeId) : null}
        nodeLabel={selectedNode?.data.label}
      />
    </div>
  )
}
