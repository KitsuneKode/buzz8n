'use client'

import { Textarea } from '@buzz8n/ui/components/textarea'
import React, { useRef, useCallback } from 'react'
import { cn } from '@buzz8n/ui/lib/utils'

interface HighlightedTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  highlightClassName?: string
  disabled?: boolean
  rows?: number
}

export function HighlightedTextarea({
  value,
  onChange,
  placeholder = '',
  className = '',
  highlightClassName = 'bg-blue-100 dark:bg-primary text-blue-700 dark:text-white',
  disabled = false,
  rows = 4,
}: HighlightedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Regex to match {{anything}} pattern
  const EXPRESSION_REGEX = /({{.*?}})/g

  // Synchronize scroll between textarea and highlight div
  const syncScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current && e.currentTarget) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }, [])

  // Parse and highlight the text
  const renderHighlightedText = () => {
    if (!value) return <span>&nbsp;</span>

    const parts = value.split(EXPRESSION_REGEX)

    return parts.map((part, index) => {
      if (part.match(EXPRESSION_REGEX)) {
        return (
          <span key={index} className={cn('rounded px-0.5', highlightClassName)}>
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className="relative w-full">
      {/* Highlighted content div */}
      <div
        ref={highlightRef}
        className={cn(
          'pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words',
          'rounded-md border border-transparent px-3 py-2 text-sm',
          'select-none',
          className,
        )}
        style={{
          color: 'transparent',
          caretColor: 'transparent',
        }}
        aria-hidden="true"
      >
        <div className="text-foreground">{renderHighlightedText()}</div>
      </div>

      {/* Actual textarea (transparent text) */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'relative z-10 resize-none bg-transparent',
          value && 'text-transparent caret-foreground',
          className,
        )}
        style={{
          WebkitTextFillColor: value ? 'transparent' : undefined,
        }}
      />
    </div>
  )
}
