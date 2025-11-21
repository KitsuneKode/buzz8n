'use client'

import type { DocSection } from '@/lib/docs/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@buzz8n/ui/lib/utils'
import { NavItem } from './NavItem'
import { useState } from 'react'

interface NavGroupProps {
  section: DocSection
  level?: number
}

export function NavGroup({ section, level = 0 }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  // If it's a direct link with no children
  if (section.href && !section.items) {
    return <NavItem title={section.title} href={section.href} badge={section.badge} level={level} />
  }

  // If it's a group with children
  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
          'text-foreground hover:bg-accent',
          level > 0 && 'ml-4',
        )}
      >
        <span>{section.title}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isOpen && 'transform rotate-180')}
        />
      </button>
      {isOpen && section.items && (
        <div className="space-y-1 mt-1">
          {section.items.map((item, index) => (
            <NavGroup key={item.href || index} section={item} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
