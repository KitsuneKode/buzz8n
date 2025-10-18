'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@buzz8n/ui/components/select'
import { Textarea } from '@buzz8n/ui/components/textarea'
import { Switch } from '@buzz8n/ui/components/switch'
import { Button } from '@buzz8n/ui/components/button'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { Badge } from '@buzz8n/ui/components/badge'
import React from 'react'

import InputPassword from '@/components/shadcn-studio/input/password-input'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import CopyButton from '../shadcn-studio/button/copy-button'
import { AlertCircle, Settings, Trash2 } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard'

export function PropertiesPanel() {
  const {
    nodes,
    selectedNodeId,
    updateSelectedNodeConfig,
    setSelectedNodeCredentialRef,
    deleteNode,
  } = useWorkflowEditorStore()
  const { credentials, openCredentialModal } = useDashboardStore()
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  if (!selectedNode) {
    return <div className="p-4 text-center text-muted-foreground">No node selected</div>
  }
  const nodeConfig = selectedNode.data.config || {}

  const requiredCredentials =
    selectedNode.data.type === 'telegramSendMessage'
      ? ['telegram']
      : selectedNode.data.type === 'emailSend'
        ? ['email']
        : []

  const handleConfigChange = (key: string, value: string | unknown) => {
    updateSelectedNodeConfig({ [key]: value })
  }

  const handleDeleteNode = () => {
    if (!selectedNodeId) return
    deleteNode(selectedNodeId)
  }

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
      <div className="flex-1 overflow-y-auto px-2 z-60-4 space-y-6">
        {/* Credentials Section */}

        {requiredCredentials.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Credential to connect with</Label>
            <Select
              defaultValue={selectedNode.data.credentials?.id || ''}
              onValueChange={(id) => {
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
              <SelectTrigger>
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
        {selectedNode.data.type === 'telegramSendMessage' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatId">Chat ID</Label>
              <Input
                id="chatId"
                placeholder="Enter chat ID"
                value={nodeConfig.chatId || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('chatId', e.target.value)
                }
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('to', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={nodeConfig.subject || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('subject', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                placeholder="Email body"
                rows={4}
                value={nodeConfig.body || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleConfigChange('body', e.target.value)
                }
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
              <Label htmlFor="path">Webhook URL</Label>
              <Textarea
                id="path"
                rows={4}
                placeholder="https://buzz8n.kitsulabs.xyz/webhook/:handler"
                value={`https://buzz8n.kitsulabs.xyz/webhook/${nodeConfig.path}`}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleConfigChange('path', e.target.value)
                }
                readOnly
                className="caret-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-0 focus:outline-none"
              />
              <CopyButton
                copyContent={`https://buzz8n.kitsulabs.xyz/webhook/${nodeConfig.path}`}
                compact
                className="absolute right-5 -translate-y-12 z-30 "
              />
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="absolute right-4 -translate-y-12 z-30"
              > */}
              {/* {copied ? <Check className="text-primary h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button> */}
            </div>
            {nodeConfig.secret && (
              <div className="space-y-2 ">
                <InputPassword
                  defaultValue={nodeConfig.secret}
                  className="caret-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-0 focus:outline-none"
                />
              </div>
            )}
            <div className="space-y-2 flex justify-between text-primary">
              {nodeConfig.secret ? (
                <CopyButton copyTag="Copy Secret" copyContent={nodeConfig.secret || ''} />
              ) : (
                <div />
              )}
              <div className="gap-x-4 flex">
                <Label htmlFor="secret">Authenticated</Label>
                <Switch
                  id="secret"
                  defaultChecked={!!nodeConfig.secret}
                  onCheckedChange={(e) => {
                    const val = e.valueOf()
                    console.log(val)
                    let value = null
                    if (val) {
                      value = crypto.randomUUID()
                    }
                    handleConfigChange('secret', value)
                  }}
                />
              </div>
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
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleConfigChange('notes', e.target.value)
            }
          />
        </div>
      </div>

      {/* Footer Actions
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div> */}
    </div>
  )
}
