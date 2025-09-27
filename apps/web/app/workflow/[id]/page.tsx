'use client'

import { WorkflowEditor } from '@/components/workflow/WorkflowEditor'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { WorkflowData } from '@/lib/types/workflow'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

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
  const { setWorkflow } = useWorkflowEditorStore()

  useEffect(() => {
    // In a real app, you would fetch the workflow by ID
    const workflowId = params.id as string

    // For now, use mock data
    setWorkflow({
      ...mockWorkflow,
      id: workflowId,
    })
  }, [params.id, setWorkflow])

  return (
    <div className="pt-16">
      <WorkflowEditor />
    </div>
  )
}
