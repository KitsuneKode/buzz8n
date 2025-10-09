import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/utils/get-query-client'
import { prefetchWorkflow } from '@/hooks/useWorkflow'
import { WorkflowClient } from './workflow-client'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

interface WorkflowPageProps {
  params: { id: string }
}

async function WorkflowDataProvider({ id }: { id: string }) {
  const queryClient = getQueryClient()
  const cookieHeader = (await cookies()).toString()

  if (id === 'new') {
    // For new workflow, no prefetching needed
    return <WorkflowClient />
  }

  try {
    // Prefetch workflow data
    const workflow = prefetchWorkflow(id, cookieHeader)

    if (!workflow) {
      notFound()
    }

    // Set the data in the query cache
    await queryClient.setQueryData(['workflows', 'detail', id], workflow)

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkflowClient />
      </HydrationBoundary>
    )
  } catch (error) {
    console.error('Failed to fetch workflow:', error)
    notFound()
  }
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowDataProvider id={id} />
    </Suspense>
  )
}
