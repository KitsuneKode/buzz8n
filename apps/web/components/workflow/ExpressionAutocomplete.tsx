'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@buzz8n/ui/components/popover'
import { HighlightWithinTextarea } from 'react-highlight-within-textarea'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { getUpstreamNodes } from '@/utils/graph-helpers'
import { cn } from '@buzz8n/ui/lib/utils'
import { useRef, useState } from 'react'

interface Suggestion {
  label: string
  insertText: string
  detail?: string
}

interface ExpressionAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  nodeId?: string
}

export function ExpressionAutocomplete({
  value,
  onChange,
  placeholder,
  nodeId,
}: ExpressionAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPos, setCursorPos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { nodes, edges } = useWorkflowEditorStore()

  // Detect template context and generate suggestions
  const getSuggestionsForContext = (text: string, cursorPosition: number): Suggestion[] => {
    const textBeforeCursor = text.slice(0, cursorPosition)
    const lastTemplateStart = textBeforeCursor.lastIndexOf('{{')

    if (lastTemplateStart === -1) return []

    const templateContent = textBeforeCursor.slice(lastTemplateStart + 2).trim()

    // Suggest $json or $node at the start
    if (!templateContent || templateContent.startsWith('$')) {
      return [
        { label: '$json', insertText: '$json', detail: 'Trigger payload' },
        { label: '$node', insertText: '$node.', detail: 'Previous node outputs' },
      ].filter((s) => s.label.startsWith(templateContent))
    }

    // Suggest node IDs after $node.
    if (templateContent.startsWith('$node.') && nodeId) {
      const nodePrefix = templateContent.slice(6) // after "$node."
      const upstreamNodes = getUpstreamNodes(nodeId, nodes, edges)

      return upstreamNodes
        .filter(
          (n) =>
            n.id.startsWith(nodePrefix) ||
            (n.data?.label &&
              String(n.data.label).toLowerCase().includes(nodePrefix.toLowerCase())),
        )
        .map((n) => ({
          label: String(n.data?.label || n.id),
          insertText: n.id,
          detail: String(n.data?.type || 'node'),
        }))
    }

    // Suggest common fields after node ID
    if (templateContent.match(/\$node\.[^.]+\.$/)) {
      return [
        { label: 'data', insertText: 'data', detail: 'Output data' },
        { label: 'status', insertText: 'status', detail: 'Execution status' },
      ]
    }

    return []
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    setCursorPos(newValue.length) // Approximate cursor position

    const suggestions = getSuggestionsForContext(newValue, newValue.length)
    setSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0)
  }

  const insertSuggestion = (suggestion: Suggestion) => {
    if (!inputRef.current) return

    const textBeforeCursor = value.slice(0, cursorPos)
    const textAfterCursor = value.slice(cursorPos)
    const lastTemplateStart = textBeforeCursor.lastIndexOf('{{')
    const templateContent = textBeforeCursor.slice(lastTemplateStart + 2)

    const beforeTemplate = textBeforeCursor.slice(0, lastTemplateStart + 2)
    const needsClose = !/^\s*[^}]*\}\}/.test(templateContent + textAfterCursor)
    const suffix = needsClose ? ' }}' : ''
    const newValue = beforeTemplate + suggestion.insertText + suffix + textAfterCursor

    onChange(newValue)
    setShowSuggestions(false)
  }
  return (
    <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
      <PopoverTrigger asChild>
        <div className="relative">
          <div
            className={cn(
              'relative rounded border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
              // Add subtle background when expressions are present
              value.includes('{{') && 'bg-blue-50/30',
            )}
          >
            <HighlightWithinTextarea
              ref={inputRef}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              highlight={[/\{\{[^}]*\}\}/g]}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="space-y-1">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => insertSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex justify-between items-center"
            >
              <span className="font-mono text-sm">{suggestion.label}</span>
              {suggestion.detail && (
                <span className="text-xs text-gray-500">{suggestion.detail}</span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
