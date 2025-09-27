'use client'

import { Button } from '@buzz8n/ui/components/button'
import { 
  LayoutDashboard, 
  User, 
  FolderOpen, 
  Settings, 
  HelpCircle,
  Lightbulb,
  Star
} from 'lucide-react'
import Link from 'next/link'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: User, label: 'Personal', href: '/personal', active: true },
]

const projectItems = [
  { label: 'My project', href: '/project/my-project' },
]

const bottomItems = [
  { icon: Settings, label: 'Admin Panel', href: '/admin' },
  { icon: FolderOpen, label: 'Templates', href: '/templates' },
  { icon: Settings, label: 'Variables', href: '/variables' },
  { icon: LayoutDashboard, label: 'Insights', href: '/insights' },
  { icon: HelpCircle, label: 'Help', href: '/help' },
  { icon: Lightbulb, label: "What's New", href: '/whats-new' },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">n8n</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">n8n</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
                  item.active ? 'bg-sidebar-accent' : ''
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Projects section */}
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-sidebar-foreground/70 mb-2 px-2">
            Projects
          </div>
          <div className="space-y-1">
            {projectItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <FolderOpen className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-medium">MB</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              Manash Bhuyan
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-6 h-6">
            <Star className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
