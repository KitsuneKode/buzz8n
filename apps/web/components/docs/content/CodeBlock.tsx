'use client'

import { Check, Copy } from 'lucide-react'
import { cn } from '@buzz8n/ui/lib/utils'
import { useState } from 'react'

interface CodeBlockProps {
  children: string
  language?: string
  title?: string
  className?: string
}

export function CodeBlock({ children, language, title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative group my-6 not-prose', className)}>
      {title && (
        <div className="bg-muted px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0">
          {title}
        </div>
      )}
      <div className="relative">
        <pre
          className={cn(
            'bg-muted/50 p-4 rounded-lg overflow-x-auto border text-sm font-mono',
            title && 'rounded-t-none',
          )}
        >
          <code className={language ? `language-${language}` : ''}>{children}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
