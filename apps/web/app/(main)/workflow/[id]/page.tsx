import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/utils/get-query-client'
import { prefetchWorkflow } from '@/hooks/useWorkflow'
import { notFound, redirect } from 'next/navigation'
import { WorkflowClient } from './workflow-client'
import { cookies } from 'next/headers'

interface WorkflowPageProps {
  params: Promise<{ id: string }>
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  if (id === 'new') {
    redirect('/dashboard?create=true')
  }

  const queryClient = getQueryClient()
  const cookieHeader = (await cookies()).toString()

  await queryClient.prefetchQuery({
    queryKey: ['workflows', 'detail', id],
    queryFn: () => prefetchWorkflow(id, cookieHeader),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkflowClient />
    </HydrationBoundary>
  )
}
