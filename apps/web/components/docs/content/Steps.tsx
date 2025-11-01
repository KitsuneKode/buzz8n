import { cn } from '@buzz8n/ui/lib/utils'
import React from 'react'

interface StepsProps {
  children: React.ReactNode
  className?: string
}

interface StepProps {
  number?: number
  title: string
  children: React.ReactNode
  className?: string
}

export function Steps({ children, className }: StepsProps) {
  return <div className={cn('space-y-8 my-8 not-prose', className)}>{children}</div>
}

function Step({ number, title, children, className }: StepProps) {
  return (
    <div
      className={cn(
        'relative pl-8 pb-8 border-l-2 border-border last:border-l-0 last:pb-0',
        className,
      )}
    >
      {/* Step Number */}
      <div className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg border-4 border-background z-10">
        {number}
      </div>

      {/* Content */}
      <div className="pl-4">
        <h3 className="text-xl font-semibold mb-3 mt-0">{title}</h3>
        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:my-3 prose-p:leading-relaxed prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-pre:my-4 prose-h4:text-base prose-h4:font-semibold prose-h4:mb-2 prose-h4:mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

Steps.Step = Step
