'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@buzz8n/ui/components/dialog'
import { WorkflowEditor } from '@/components/workflow/WorkflowEditor'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@buzz8n/ui/components/button'
import { useEffect, useMemo, useState } from 'react'
import { Label } from '@buzz8n/ui/components/label'
import { Input } from '@buzz8n/ui/components/input'
import { WorkflowData } from '@/lib/types/workflow'

// Mock workflow data
const mockWorkflow: WorkflowData = {
  id: 'workflow_1',
  name: 'My workflow 2',
  nodes: [],
  edges: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  active: false,
}

export default function WorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const { setWorkflow } = useWorkflowEditorStore()

  const [open, setOpen] = useState<boolean>(false)
  const defaultProjectNumber = useMemo(() => `${Date.now()}`.slice(-6), [])
  const [projectName, setProjectName] = useState<string>('New Workflow')
  const [projectNumber, setProjectNumber] = useState<string>(defaultProjectNumber)

  useEffect(() => {
    const workflowId = params.id as string
    if (workflowId === 'new') {
      setOpen(true)
    } else {
      // For now, use mock data
      setWorkflow({
        ...mockWorkflow,
        id: workflowId,
      })
    }
  }, [params.id, setWorkflow])

  const handleCreate = () => {
    const id = `workflow_${projectNumber || Date.now()}`
    const now = new Date()
    const wf: WorkflowData = {
      id,
      name: projectName.trim() || `Workflow ${projectNumber}`,
      nodes: [],
      edges: [],
      createdAt: now,
      updatedAt: now,
      active: false,
    }
    setWorkflow(wf)
    setOpen(false)
    router.replace(`/workflow/${id}`)
  }

  return (
    <div className="pt-16">
      <WorkflowEditor />

      {/* New Workflow Dialog */}
      <Dialog
        open={open}
        onOpenChange={(state) => {
          setOpen(state)
          if (state === false) {
            router.back()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My awesome workflow"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectNumber">Project Number</Label>
              <Input
                id="projectNumber"
                placeholder="e.g. 123456"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  router.back()
                }}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <Button onClick={handleCreate}>Save & Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
