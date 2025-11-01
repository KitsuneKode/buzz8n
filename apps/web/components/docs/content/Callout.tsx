import { Info, AlertTriangle, XCircle, CheckCircle, Lightbulb } from 'lucide-react'
import { cn } from '@buzz8n/ui/lib/utils'

interface CalloutProps {
  type?: 'info' | 'warning' | 'error' | 'success' | 'tip'
  title?: string
  children: React.ReactNode
  className?: string
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
  tip: Lightbulb,
}

const styles = {
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  warning:
    'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
  error:
    'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
  success:
    'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  tip: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100',
}

const iconStyles = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  success: 'text-green-500',
  tip: 'text-purple-500',
}

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
  const Icon = icons[type]

  return (
    <div className={cn('rounded-lg border p-4 my-6 not-prose', styles[type], className)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[type])} />
        <div className="flex-1 text-sm leading-relaxed">
          {title && <div className="font-semibold mb-2">{title}</div>}
          <div className="[&>p]:my-2 [&>ul]:my-2 [&>ul]:ml-4 [&>ul]:list-disc [&>ol]:my-2 [&>ol]:ml-4 [&>ol]:list-decimal [&>li]:my-1 [&>code]:bg-black/10 [&>code]:dark:bg-white/10 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&>a]:underline [&>a]:font-medium">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
