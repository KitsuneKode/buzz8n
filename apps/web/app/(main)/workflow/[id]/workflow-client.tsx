'use client'

import { WorkflowEditor } from '@/components/workflow/WorkflowEditor'
import { WorkflowModal } from '@/components/workflow/WorkflowModal'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useSuspenseQuery } from '@tanstack/react-query'
import { prefetchWorkflow } from '@/hooks/useWorkflow'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function WorkflowClient() {
  const params = useParams()
  const router = useRouter()

  const { data: workflow } = useSuspenseQuery({
    queryKey: ['workflows', 'detail', params.id],
    queryFn: () => prefetchWorkflow(params.id as string),
  })

  const { setWorkflow } = useWorkflowEditorStore()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const workflowId = params.id as string

    if (workflowId === 'new') {
      setShowModal(true)
    } else if (workflow) {
      setWorkflow(workflow)
    }
  }, [params.id, workflow, setWorkflow])

  const handleModalClose = (open: boolean) => {
    setShowModal(open)
    if (!open) {
      router.back()
    }
  }

  return (
    <div className="pt-16">
      <WorkflowEditor />

      <WorkflowModal open={showModal} onOpenChange={handleModalClose} />
    </div>
  )
}
