'use client'

import { ScrollArea } from '@buzz8n/ui/components/scroll-area'
import { docsNavigation } from '@/lib/docs/navigation'
import { Input } from '@buzz8n/ui/components/input'
import { NavGroup } from '../navigation/NavGroup'
import { Search } from 'lucide-react'

export function DocsSidebar() {
  return (
    <aside className="w-72 h-screen sticky top-0 border-r bg-background flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold mb-4">Documentation</h2>

        {/* Search - placeholder for now */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search docs..." className="pl-9" disabled />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-6 space-y-6">
          {docsNavigation.map((section, index) => (
            <div key={section.title || index}>
              <NavGroup section={section} />
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
