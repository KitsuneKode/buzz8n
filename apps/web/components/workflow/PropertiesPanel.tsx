'use client'

import { NodeExecutionDetailDialog } from './NodeExecutionDetailDialog'
import { CredentialsInfiniteSelect } from './CredentialsInfiniteSelect'
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
  const { credentials, openCredentialModal, setCredentialCreationContext } = useDashboardStore()
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
    <div className="flex flex-col min-h-0">
      {/* Node Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-medium">
              {selectedNode.data.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteNode}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </div>

      {/* Properties Form */}
      <div className="px-6 py-6 space-y-8">
        {/* Credentials Section */}

        {requiredCredentials.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Credential to connect with
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Select or create a credential for this node
              </p>
            </div>
            <CredentialsInfiniteSelect
              value={selectedNode.data.credentials?.id || ''}
              onValueChange={(id) => {
                if (id === 'create-new') {
                  setSelectedNodeCredentialRef(null)
                  setCredentialCreationContext('workflow-editor')
                  openCredentialModal()
                  return
                }
                const cred = credentials.find((c) => c.id === id)
                if (cred) {
                  setSelectedNodeCredentialRef({
                    id: cred.id,
                    name: cred.name,
                    provider: cred.provider,
                  })
                } else {
                  setSelectedNodeCredentialRef({
                    id: id,
                    name: id,
                    provider: requiredCredentials[0] || '',
                  })
                }
              }}
              requiredProviders={requiredCredentials}
              placeholder="Select a credential"
              showBorder={!selectedNode.data.credentials?.id}
            />
            {!selectedNode.data.credentials?.id && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-700 font-medium">Credential selection is required</p>
              </div>
            )}
          </div>
        )}

        {/* Node-specific Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Configuration</h4>
            <p className="text-xs text-muted-foreground">
              Configure the specific settings for this node
            </p>
          </div>
          <ConfigRenderer
            config={nodeConfig}
            selectedCredential={selectedNode.data.credentials}
            onConfigChange={handleConfigChange}
            defaultConfig={getDefaultConfig(selectedNode.data.type)}
            nodeType={selectedNode.data.type}
            nodeId={selectedNode.id}
          />
        </div>

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
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
              Notes
            </Label>
            <p className="text-xs text-muted-foreground">
              Add any additional notes or documentation about this node
            </p>
          </div>
          <Textarea
            id="notes"
            placeholder="Add notes about this node..."
            rows={4}
            className="resize-none"
            value={nodeConfig.notes ? nodeConfig.notes : ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleConfigChange('notes', e.target.value)
            }
          />
        </div>
      </div>

      {/* Footer Actions */}
      {canViewExecutionOutput && (
        <div className="px-6 py-4 border-t border-border bg-muted/20 sticky bottom-0">
          <Button
            onClick={handleViewExecutionOutput}
            className="w-full"
            variant="outline"
            size="lg"
          >
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
