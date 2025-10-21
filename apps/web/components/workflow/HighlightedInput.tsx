'use client'

import { Input } from '@buzz8n/ui/components/input'
import Highlighter from 'react-highlight-words'
import { cn } from '@buzz8n/ui/lib/utils'
import * as React from 'react'

interface HighlightedInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function HighlightedInput({
  value,
  onChange,
  placeholder,
  className,
}: HighlightedInputProps) {
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
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  )
}
