'use client'

import { WorkflowEditor } from '@/components/workflow/WorkflowEditor'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useSuspenseQuery } from '@tanstack/react-query'
import { prefetchWorkflow } from '@/hooks/useWorkflow'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function WorkflowClient() {
  const params = useParams()
  const router = useRouter()

  const { data: workflow, error } = useSuspenseQuery({
    queryKey: ['workflows', 'detail', params.id],
    queryFn: () => prefetchWorkflow(params.id as string),
  })

  const { setWorkflow } = useWorkflowEditorStore()

  useEffect(() => {
    if (workflow) {
      setWorkflow(workflow)
    }
    if (error) {
      router.back()
    }
  }, [setWorkflow, workflow, router, error])

  return (
    <div className="pt-16">
      <WorkflowEditor />
    </div>
  )
}
