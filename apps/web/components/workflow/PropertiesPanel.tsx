'use client'

import React from 'react'
import { Input } from '@buzz8n/ui/components/input'
import { Label } from '@buzz8n/ui/components/label'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@buzz8n/ui/components/select'
import { Switch } from '@buzz8n/ui/components/switch'
// import { Textarea } from '@buzz8n/ui/components/textarea'
// Fallback textarea component
const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props} 
  />
)
import { AlertCircle, Settings, Trash2 } from 'lucide-react'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useDashboardStore } from '@/stores/dashboard'

export function PropertiesPanel() {
  const { nodes, selectedNodeId } = useWorkflowEditorStore()
  const { credentials } = useDashboardStore()
  
  const selectedNode = nodes.find(node => node.id === selectedNodeId)
  
  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No node selected
      </div>
    )
  }

  const nodeConfig = selectedNode.data.config || {}
  const requiredCredentials = selectedNode.data.type === 'telegramGetChat' ? ['telegram'] : 
                             selectedNode.data.type === 'emailSend' ? ['email'] : []

  const handleConfigChange = (key: string, value: string | boolean) => {
    // Update node configuration
    console.log(`Updating ${key} to ${value} for node ${selectedNodeId}`)
  }

  const handleDeleteNode = () => {
    console.log(`Deleting node ${selectedNodeId}`)
  }

  return (
    <div className="flex flex-col h-full">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Credentials Section */}
        {requiredCredentials.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Credential to connect with</Label>
            <Select defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Select a credential" />
              </SelectTrigger>
              <SelectContent>
                {credentials
                  .filter(cred => requiredCredentials.includes(cred.provider))
                  .map(cred => (
                    <SelectItem key={cred.id} value={cred.id}>
                      {cred.name}
                    </SelectItem>
                  ))}
                <SelectItem value="create-new">
                  + Create new credential
                </SelectItem>
              </SelectContent>
            </Select>
            {credentials.filter(cred => requiredCredentials.includes(cred.provider)).length === 0 && (
              <div className="flex items-center space-x-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>No {requiredCredentials[0]} credentials found</span>
              </div>
            )}
          </div>
        )}

        {/* Node-specific Configuration */}
        {selectedNode.data.type === 'telegramGetChat' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                placeholder="Enter chat ID"
                value={nodeConfig.chatId || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('chatId', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedNode.data.type === 'emailSend' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="recipient@example.com"
                value={nodeConfig.to || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('to', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={nodeConfig.subject || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('subject', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                placeholder="Email body"
                rows={4}
                value={nodeConfig.body || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleConfigChange('body', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedNode.data.type === 'schedule' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <Select 
                defaultValue={nodeConfig.interval || 'daily'}
                onValueChange={(value) => handleConfigChange('interval', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="daily">Every day</SelectItem>
                  <SelectItem value="weekly">Every week</SelectItem>
                  <SelectItem value="monthly">Every month</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedNode.data.type === 'webhook' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select 
                defaultValue={nodeConfig.method || 'POST'}
                onValueChange={(value) => handleConfigChange('method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">Path</Label>
              <Input
                id="path"
                placeholder="/webhook"
                value={nodeConfig.path || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('path', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Common Settings */}
        <div className="space-y-4 pt-4 border-t border-border">
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
        </div>

        {/* Node Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about this node..."
            rows={3}
            value={nodeConfig.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleConfigChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
