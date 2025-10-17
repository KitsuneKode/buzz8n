'use client'

import { useState } from 'react'

import { CheckIcon, CopyIcon } from 'lucide-react'

import { Button } from '@buzz8n/ui/components/button'

import { cn } from '@buzz8n/ui/lib/utils'

const CopyButton = ({
  copyContent,
  compact = false,
  copyTag = 'Copy',
  className,
}: {
  copyContent: string
  compact?: boolean
  copyTag?: string
  className?: string
}) => {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      variant={compact ? 'ghost' : 'outline'}
      size={compact ? 'icon' : 'default'}
      className={cn('relative disabled:opacity-100', className)}
      onClick={handleCopy}
      disabled={copied}
    >
      <span
        className={cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}
      >
        <CheckIcon className="stroke-green-600 dark:stroke-green-400" />
      </span>
      <span
        className={cn(
          'absolute left-4 transition-all',
          copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
          compact && 'left-3',
        )}
      >
        <CopyIcon />
      </span>
      {!compact && (copied ? 'Copied!' : copyTag)}
    </Button>
  )
}

export default CopyButton
