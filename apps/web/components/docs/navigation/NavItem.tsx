'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@buzz8n/ui/lib/utils'
import Link from 'next/link'

interface NavItemProps {
  title: string
  href: string
  badge?: 'new' | 'beta' | 'coming-soon'
  level?: number
}

const badgeStyles = {
  new: 'bg-green-500 text-white',
  beta: 'bg-yellow-500 text-white',
  'coming-soon': 'bg-muted text-muted-foreground',
}

export function NavItem({ title, href, badge, level = 0 }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        level > 0 && 'ml-4',
      )}
    >
      <span className="flex-1">{title}</span>
      {badge && (
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badgeStyles[badge])}>
          {badge === 'coming-soon' ? 'Soon' : badge}
        </span>
      )}
    </Link>
  )
}
