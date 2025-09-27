'use client'

import { Tabs, TabsList, TabsTrigger } from '@buzz8n/ui/components/tabs'
import { Button } from '@buzz8n/ui/components/button'
import { TabType } from '@/stores/dashboard'
import { ChevronDown } from 'lucide-react'

interface HeaderNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onCreateWorkflow: () => void
}

const HeaderNav = ({ activeTab, onTabChange, onCreateWorkflow }: HeaderNavProps) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'workflows', label: 'Workflows' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'executions', label: 'Executions' },
    { id: 'settings', label: 'Project settings' },
  ]

  return (
    <div className="border-b border-border bg-background rounded-xl">
      <div className="px-6">
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(value) => onTabChange(value as TabType)}
            className="w-auto"
          >
            <TabsList className="bg-transparent h-auto p-0 space-x-8">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`relative py-4 px-1 text-sm font-medium transition-colors bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === tab.id
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-3">
            <Button onClick={onCreateWorkflow} className="flex items-center space-x-2">
              <span>Create Workflow</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderNav
