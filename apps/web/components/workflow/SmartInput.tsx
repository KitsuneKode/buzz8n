'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@buzz8n/ui/components/popover'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { getUpstreamNodes } from '@/utils/graph-helpers'
import { Button } from '@buzz8n/ui/components/button'
import { Input } from '@buzz8n/ui/components/input'
import Highlighter from 'react-highlight-words'
import { ChevronRight } from 'lucide-react'
import { cn } from '@buzz8n/ui/lib/utils'
import { useState, useRef } from 'react'

interface SmartInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  nodeId?: string
}

interface Suggestion {
  label: string
  insertText: string
  detail?: string
  type: 'trigger' | 'node' | 'field'
}

export function SmartInput({ value, onChange, placeholder, className, nodeId }: SmartInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPos, setCursorPos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { nodes, edges } = useWorkflowEditorStore()

  // Detect template context and generate suggestions
  const getSuggestionsForContext = (text: string, cursorPosition: number): Suggestion[] => {
    const textBeforeCursor = text.slice(0, cursorPosition)
    const lastTemplateStart = textBeforeCursor.lastIndexOf('{{')

    // Check if we're inside a template
    if (lastTemplateStart === -1) return []

    // Check if template is closed before cursor
    const textAfterTemplateStart = textBeforeCursor.slice(lastTemplateStart)
    if (textAfterTemplateStart.includes('}}')) return []

    const templateContent = textBeforeCursor.slice(lastTemplateStart + 2).trim()

    // Suggest $json or $node at the start (when user types {{ or {{$)
    if (
      templateContent === '' ||
      templateContent === '$' ||
      (templateContent.startsWith('$') && !templateContent.includes('.'))
    ) {
      const suggestions = [
        {
          label: '$json',
          insertText: '$json.',
          detail: 'Trigger payload data',
          type: 'trigger' as const,
        },
        {
          label: '$node',
          insertText: '$node.',
          detail: 'Previous node outputs',
          type: 'trigger' as const,
        },
      ]

      if (templateContent === '') return suggestions
      return suggestions.filter((s) => s.label.startsWith(templateContent))
    }

    // Suggest $json fields (when user types {{$json.)
    if (templateContent.startsWith('$json.')) {
      const jsonPrefix = templateContent.slice(6) // after "$json."
      const allSuggestions = [
        {
          label: 'body',
          insertText: '$json.body }}',
          detail: 'Full trigger payload',
          type: 'field' as const,
        },
        {
          label: 'body.email',
          insertText: '$json.body.email }}',
          detail: 'Email from payload',
          type: 'field' as const,
        },
        {
          label: 'body.name',
          insertText: '$json.body.name }}',
          detail: 'Name from payload',
          type: 'field' as const,
        },
        {
          label: 'body.message',
          insertText: '$json.body.message }}',
          detail: 'Message from payload',
          type: 'field' as const,
        },
        {
          label: 'body.chatId',
          insertText: '$json.body.chatId }}',
          detail: 'Chat ID from payload',
          type: 'field' as const,
        },
        {
          label: 'body.recipient',
          insertText: '$json.body.recipient }}',
          detail: 'Recipient from payload',
          type: 'field' as const,
        },
        {
          label: 'body.subject',
          insertText: '$json.body.subject }}',
          detail: 'Subject from payload',
          type: 'field' as const,
        },
      ]

      if (jsonPrefix === '') return allSuggestions
      return allSuggestions.filter((s) => s.label.toLowerCase().includes(jsonPrefix.toLowerCase()))
    }

    // Suggest node IDs after $node. (when user types {{$node.)
    if (templateContent.startsWith('$node.') && nodeId) {
      const nodePrefix = templateContent.slice(6) // after "$node."

      // If we already have a node and a dot, show fields
      if (nodePrefix.includes('.')) {
        const nodePart = nodePrefix.split('.')[0]
        return [
          {
            label: 'input',
            insertText: `$node.${nodePart}.input }}`,
            detail: 'Node input config',
            type: 'field' as const,
          },
          {
            label: 'output',
            insertText: `$node.${nodePart}.output }}`,
            detail: 'Node output data',
            type: 'field' as const,
          },
          {
            label: 'output.data',
            insertText: `$node.${nodePart}.output.data }}`,
            detail: 'Node output data',
            type: 'field' as const,
          },
          {
            label: 'output.status',
            insertText: `$node.${nodePart}.output.status }}`,
            detail: 'Node execution status',
            type: 'field' as const,
          },
        ]
      }

      const upstreamNodes = getUpstreamNodes(nodeId, nodes, edges)

      const nodeSuggestions = upstreamNodes.map((n) => ({
        label: String(n.data?.label || n.id),
        insertText: `$node.${n.id}.`,
        detail: String(n.data?.type || 'node'),
        type: 'node' as const,
      }))

      if (nodePrefix === '') return nodeSuggestions

      return nodeSuggestions.filter(
        (s) =>
          s.insertText.toLowerCase().includes(nodePrefix.toLowerCase()) ||
          s.label.toLowerCase().includes(nodePrefix.toLowerCase()),
      )
    }

    return []
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart || 0

    onChange(newValue)
    setCursorPos(cursorPosition)

    const suggestions = getSuggestionsForContext(newValue, cursorPosition)
    setSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0)
  }

  const insertSuggestion = (suggestion: Suggestion) => {
    if (!inputRef.current) return

    const textBeforeCursor = value.slice(0, cursorPos)
    const textAfterCursor = value.slice(cursorPos)
    const lastTemplateStart = textBeforeCursor.lastIndexOf('{{')

    // Replace from {{ to cursor position
    const beforeTemplate = value.slice(0, lastTemplateStart)
    const newValue = beforeTemplate + '{{ ' + suggestion.insertText + textAfterCursor

    onChange(newValue)
    setShowSuggestions(false)

    // Set cursor position after insertion
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = (beforeTemplate + '{{ ' + suggestion.insertText).length
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
        inputRef.current.focus()
      }
    }, 0)
  }

  // Define highlight patterns for template expressions
  const searchWords = value.match(/\{\{[^}]*?\}\}/g) || []

  return (
    <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
      <PopoverTrigger asChild>
        <div className="relative">
          <div
            className={cn(
              'relative rounded border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
              // Add subtle background when expressions are present
              value.includes('{{') && 'bg-blue-50/30',
              className,
            )}
          >
            <Input
              ref={inputRef}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className={cn(
                'w-full font-mono text-sm border-0 focus:outline-none relative z-10 bg-transparent',
              )}
            />

            {/* Overlay for highlighting - behind the input */}
            {value && searchWords.length > 0 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center px-3">
                <Highlighter
                  highlightClassName="text-blue-600 bg-blue-100/50 px-0.5 rounded"
                  searchWords={searchWords}
                  autoEscape={false}
                  textToHighlight={value}
                  className="font-mono text-sm text-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start" side="bottom">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm font-mono hover:bg-blue-50"
              onClick={() => insertSuggestion(suggestion)}
            >
              <div className="flex items-center w-full">
                <ChevronRight className="h-3 w-3 mr-2 text-gray-400" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">{suggestion.label}</div>
                  {suggestion.detail && (
                    <div className="text-xs text-gray-500">{suggestion.detail}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {suggestion.type === 'trigger' && '🔗'}
                  {suggestion.type === 'node' && '📦'}
                  {suggestion.type === 'field' && '📄'}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
