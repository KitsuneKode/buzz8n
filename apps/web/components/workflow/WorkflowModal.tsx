'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@buzz8n/ui/components/dialog'
import { useCreateWorkflow } from '@/hooks/useWorkflow'
import { Button } from '@buzz8n/ui/components/button'
import { toast } from '@buzz8n/ui/components/sonner'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { useState, useTransition } from 'react'

interface WorkflowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkflowModal({ open, onOpenChange }: WorkflowModalProps) {
  const [isSubmitting, startTransition] = useTransition()
  const createWorkflowMutation = useCreateWorkflow()

  // Generate random workflow number
  const generateWorkflowNumber = () => {
    return Math.floor(Math.random() * 900000) + 100000 // 6-digit number
  }

  const [workflowNumber] = useState(() => generateWorkflowNumber())
  const [workflowName, setWorkflowName] = useState(`New Workflow ${workflowNumber}`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      if (!workflowName.trim()) {
        return
      }

      try {
        const name = workflowName.trim() || `New Workflow ${workflowNumber}`

        await createWorkflowMutation.mutateAsync({
          name,
          active: false,
        })

        // Reset form
        setWorkflowName('')
        onOpenChange(false)
      } catch {
        toast.error('Failed to create workflow')
        // Error handling is done in the mutation
      }
    })
  }

  const handleCancel = () => {
    setWorkflowName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="workflowName">Workflow Name</Label>
            <Input
              id="workflowName"
              placeholder={`New Workflow ${workflowNumber}`}
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to use: New Workflow {workflowNumber}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createWorkflowMutation.isPending}>
              {isSubmitting || createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
