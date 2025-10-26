'use client'

import { WorkflowEditor } from '@/components/workflow/WorkflowEditor'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useSuspenseQuery } from '@tanstack/react-query'
import { prefetchWorkflow } from '@/hooks/useWorkflow'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function WorkflowClient() {
  const params = useParams()
  const router = useRouter()
  const initializedWorkflowId = useRef<string | null>(null)

  const { data: workflow, error } = useSuspenseQuery({
    queryKey: ['workflows', 'detail', params.id],
    queryFn: () => prefetchWorkflow(params.id as string),
    // Prevent refetching to avoid resetting unsaved changes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retryOnMount: false,
    retry: 0,
    staleTime: Infinity, // Data never goes stale - only refetch on explicit invalidation
  })

  const { setWorkflow, setCurrentExecution } = useWorkflowEditorStore()

  // Only initialize workflow once when ID changes, not when workflow data changes
  useEffect(() => {
    if (error) {
      router.back()
      return
    }

    // Only set workflow if we haven't initialized this ID yet
    // This prevents resetting the editor when React Query re-renders with same data
    if (workflow && initializedWorkflowId.current !== workflow.id) {
      initializedWorkflowId.current = workflow.id
      setWorkflow(workflow)
      setCurrentExecution(null)
      useWorkflowEditorStore.setState({
        isFitView: workflow.nodes.length > 3,
      })
    }
  }, [workflow, setWorkflow, error, router, setCurrentExecution])

  return (
    <div className="pt-16">
      <WorkflowEditor />
    </div>
  )
}
