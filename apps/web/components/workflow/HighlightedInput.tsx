import { cn } from '@buzz8n/ui/lib/utils'
import { useRef } from 'react'

interface HighlightedInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  highlightClassName?: string
}

export function HighlightedInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  highlightClassName = 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
}: HighlightedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const EXPRESSION_REGEX = /({{.*?}})/g

  const syncScroll = (e: React.UIEvent<HTMLInputElement>) => {
    if (highlightRef.current && e.currentTarget) {
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  const renderHighlightedText = () => {
    if (!value) return <span>&nbsp;</span>

    return value.split(EXPRESSION_REGEX).map((part, index) => {
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
      <div
        ref={highlightRef}
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap',
          'flex h-10 items-center rounded-md border border-transparent px-3 py-2 text-sm',
          className,
        )}
        aria-hidden="true"
      >
        <div className="text-foreground">{renderHighlightedText()}</div>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        className={cn(
          'relative z-10 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          value && 'caret-foreground',
          className,
        )}
        style={{
          WebkitTextFillColor: value ? 'transparent' : undefined,
        }}
      />
    </div>
  )
}
