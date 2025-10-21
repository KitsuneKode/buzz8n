'use client'

import { Textarea } from '@buzz8n/ui/components/textarea'
import Highlighter from 'react-highlight-words'
import { cn } from '@buzz8n/ui/lib/utils'

interface HighlightedTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function HighlightedTextarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 4,
}: HighlightedTextareaProps) {
  // Define highlight patterns for template expressions
  const searchWords = value.match(/\{\{[^}]*?\}\}/g) || []

  return (
    <div className="relative">
      <div
        className={cn(
          'relative rounded border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          // Add subtle background when expressions are present
          value.includes('{{') && 'bg-blue-50/30',
          className,
        )}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            'w-full font-mono text-sm border-0 focus:outline-none resize-none relative z-10 bg-transparent',
          )}
        />

        {/* Overlay for highlighting - behind the textarea */}
        {value && searchWords.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden p-3">
            <Highlighter
              highlightClassName="text-blue-600 bg-blue-100/50 px-0.5 rounded"
              searchWords={searchWords}
              autoEscape={false}
              textToHighlight={value}
              className="font-mono text-sm text-transparent whitespace-pre-wrap break-words"
            />
          </div>
        )}
      </div>
    </div>
  )
}
