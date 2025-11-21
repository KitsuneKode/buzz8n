import { cn } from '@buzz8n/ui/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LinkCardProps {
  href: string
  title: string
  description: string
  className?: string
}

export function LinkCard({ href, title, description, className }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary transition-colors group not-prose',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors text-base">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground m-0">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
      </div>
    </Link>
  )
}
