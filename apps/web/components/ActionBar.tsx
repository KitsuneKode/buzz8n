'use client'

import { Button } from '@buzz8n/ui/components/button'
import { Plus } from 'lucide-react'

interface ActionBarProps {
  onCreateWorkflow: () => void
  onNewCredential: () => void
}

const ActionBar = ({ onCreateWorkflow, onNewCredential }: ActionBarProps) => {
  return (
    <div className="flex items-center  justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your workflows, credentials, and executions</p>
      </div>

      <div className="flex items-center space-x-3">
        <Button onClick={onNewCredential} variant="outline">
          New credential
        </Button>
        <Button onClick={onCreateWorkflow} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create workflow</span>
        </Button>
      </div>
    </div>
  )
}

export default ActionBar
