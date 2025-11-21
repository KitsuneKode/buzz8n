'use client'

import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { getUpstreamNodes } from '@/utils/graph-helpers'
import { ChevronRight, Sparkles, X } from 'lucide-react'
import { Button } from '@buzz8n/ui/components/button'
import { Node } from '@xyflow/react'
import React from 'react'

interface VariablePickerProps {
  currentNodeId: string
  onInsert: (template: string) => void
  onClose: () => void
}

export function VariablePicker({ currentNodeId, onInsert, onClose }: VariablePickerProps) {
  const { nodes, edges } = useWorkflowEditorStore()
  const upstreamNodes = getUpstreamNodes(currentNodeId, nodes, edges)

  // Trigger fields - common webhook/trigger data
  // const triggerFields = [
  //   { path: '$json.body', label: 'Full trigger payload' },
  //   { path: '$json.body.email', label: 'Email from payload' },
  //   { path: '$json.body.name', label: 'Name from payload' },
  //   { path: '$json.body.message', label: 'Message from payload' },
  //   { path: '$json.body.chatId', label: 'Chat ID from payload' },
  //   { path: '$json.body.recipient', label: 'Recipient from payload' },
  //   { path: '$json.body.subject', label: 'Subject from payload' },
  // ]

  // Previous node input configs (resolved values)
  const getPreviousNodeInputs = (): Array<{ path: string; label: string }> => {
    const inputs: Array<{ path: string; label: string }> = []
    const typeCounters: Map<string, number> = new Map()

    upstreamNodes.forEach((node) => {
      const nodeType = node.data?.type
      if (nodeType && typeof nodeType === 'string') {
        // Match backend logic: first is nodeType, then nodeType1, nodeType2, etc.
        const count: number = typeCounters.get(nodeType) ?? 1
        const key: string = count === 1 ? nodeType : `${nodeType}${count}`
        typeCounters.set(nodeType, count + 1)

        // Add common input fields based on node type
        switch (nodeType) {
          case 'emailSend':
            inputs.push(
              { path: `$json.${key}.to`, label: `${node.data?.label || nodeType} → To` },
              { path: `$json.${key}.subject`, label: `${node.data?.label || nodeType} → Subject` },
              { path: `$json.${key}.body`, label: `${node.data?.label || nodeType} → Body` },
            )
            break
          case 'telegramSendMessage':
            inputs.push(
              { path: `$json.${key}.chatId`, label: `${node.data?.label || nodeType} → Chat ID` },
              { path: `$json.${key}.message`, label: `${node.data?.label || nodeType} → Message` },
            )
            break
          case 'aiAgent':
            inputs.push(
              { path: `$json.${key}.prompt`, label: `${node.data?.label || nodeType} → Prompt` },
              { path: `$json.${key}.model`, label: `${node.data?.label || nodeType} → Model` },
            )
            break
        }
      }
    })
    return inputs
  }

  // Output fields per node type
  const getOutputFields = (node: Node) => {
    switch (node.data?.type) {
      case 'emailSend':
        return [
          { path: 'data.data.id', label: 'Send ID' },
          { path: 'status', label: 'Status' },
        ]
      case 'telegramSendMessage':
        return [
          { path: 'data.result.message_id', label: 'Message ID' },
          { path: 'status', label: 'Status' },
        ]
      case 'aiAgent':
        return [
          { path: 'data.response', label: 'AI Response' },
          { path: 'status', label: 'Status' },
        ]
      default:
        return []
      // return [
      //   { path: 'data', label: 'Output' },
      //   { path: 'status', label: 'Status' },
      // ]
    }
  }

  return (
    <div className=" bg-card border rounded-lg shadow-lg ">
      {/* Header */}
      <div className="p-3 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="font-semibold text-sm">Insert Variable</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea
        className="h-80"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Trigger Data */}
        {/* <div className="p-3 border-b"> */}
        {/* <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Trigger Data</h4> */}
        {/* <div className="space-y-1">
            {triggerFields.map((field) => (
              <Button
                key={field.path}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-mono hover:bg-blue-50"
                onClick={() => {
                  onInsert(`{{ ${field.path} }}`)
                  onClose()
                }}
              >
                <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                {field.label}
              </Button>
            ))}
          </div> */}
        {/* </div> */}

        {/* Previous Node Inputs */}
        {getPreviousNodeInputs().length > 0 && (
          <div className="p-3 border-b">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Previous Node Inputs
            </h4>
            <div className="space-y-1">
              {getPreviousNodeInputs().map((field, index) => (
                <Button
                  key={`input-${index}`}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm font-mono hover:bg-green-50"
                  onClick={() => {
                    onInsert(`{{ ${field.path} }}`)
                    onClose()
                  }}
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                  {field.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Previous Nodes */}
        {upstreamNodes.length > 0 ? (
          <div className="p-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Previous Nodes</h4>
            <div className="space-y-3">
              {upstreamNodes.map((node) => {
                const outputs = getOutputFields(node)
                return (
                  <div key={node.id} className="space-y-1">
                    {/* Node label */}
                    <div className="text-xs font-medium text-gray-700">
                      {outputs.length > 0 && (
                        <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                          {String(node.data?.label || node.data?.type || node.id || 'Unknown Node')}
                        </span>
                      )}
                    </div>
                    {/* Output fields */}
                    {outputs.map((output) => (
                      <Button
                        key={output.path}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm font-mono pl-6 hover:bg-blue-50"
                        onClick={() => {
                          // Insert node ID (stable), not label
                          onInsert(`{{ $node.${node.id}.output.${output.path} }}`)
                          onClose()
                        }}
                      >
                        <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
                        {output.label}
                      </Button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 text-sm text-gray-500 text-center">No previous nodes available</div>
        )}
      </ScrollArea>
    </div>
  )
}
