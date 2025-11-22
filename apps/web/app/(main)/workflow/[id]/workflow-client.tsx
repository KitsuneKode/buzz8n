'use client'

import { prefetchWorkflow, useLatestExecution } from '@/hooks/useWorkflow'
import { WorkflowEditor } from '@/components/workflow/WorkflowEditor'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useWebSocketStore } from '@/hooks/useWebSocket'
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

  // Fetch latest in-progress execution (if any)
  const { data: latestExecution } = useLatestExecution(params.id as string)

  const { setWorkflow, setCurrentExecution, updateNodeStatus } = useWorkflowEditorStore()
  const { isConnected, subscribe, unsubscribe } = useWebSocketStore()

  // Only initialize workflow once when ID changes, not when workflow data changes
  useEffect(() => {
    if (error) {
      router.back()
      return
    }

    // Only set workflow if we haven't initialized this ID yet
    // This prevents resetting the editor when React Query re-renders with same data
    if (workflow && latestExecution) {
      // Set as current execution and subscribe to WebSocket for real-time updates
      setCurrentExecution(latestExecution)
      for (const log of latestExecution.logs) {
        console.log('Replaying log for node:', log.nodeId, log.status)
        updateNodeStatus(log.nodeId, log.status)
      }
    } else {
      setCurrentExecution(null)
    }

    if (workflow && initializedWorkflowId.current !== workflow.id) {
      initializedWorkflowId.current = workflow.id
      setWorkflow(workflow)

      // Check if there's a latest execution in progress

      useWorkflowEditorStore.setState({
        isFitView: workflow.nodes.length > 3,
      })
    }
  }, [workflow, latestExecution, setWorkflow, error, router, setCurrentExecution, updateNodeStatus])

  // WebSocket connection - connect once on mount
  useEffect(() => {
    const { connect, disconnect } = useWebSocketStore.getState()
    const { clean } = useWorkflowEditorStore.getState()
    connect()

    return () => {
      disconnect()
      clean()
    }
  }, [])

  // WebSocket subscription - subscribe when we have workflow and execution
  useEffect(() => {
    if (isConnected && workflow && latestExecution) {
      console.log('📡 Subscribing to execution:', latestExecution.id)
      subscribe(workflow.id, latestExecution.id)
    }

    return () => {
      // Cleanup subscription when component unmounts or dependencies change
      if (isConnected && workflow && latestExecution) {
        console.log('🔌 Unsubscribing from execution:', latestExecution.id)
        unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id, latestExecution?.id, isConnected])

  return (
    <div className="pt-16">
      <WorkflowEditor />
    </div>
  )
}
