import { prefetchInfiniteWorkflowsList, prefetchInfiniteExecutions } from '@/hooks/useWorkflow'
import { prefetchInfiniteCredentials } from '@/utils/prefetchServerCredentials'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/utils/get-query-client'
import DataBootStrap from '@/components/DataBootStrap'
import { requireAuth } from '@/utils/auth-server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await requireAuth('/')

  const queryClient = getQueryClient()

  const cookieHeader = (await cookies()).toString()

  // Prefetch first page of credentials for infinite query
  const credentialPrefetch = queryClient.prefetchInfiniteQuery({
    queryKey: ['credentials', 'list', { infinite: true, limit: 10 }],
    queryFn: () => prefetchInfiniteCredentials(10, cookieHeader),
    initialPageParam: undefined,
  })

  // Prefetch first page of workflows for infinite query
  const workflowListPrefetch = queryClient.prefetchInfiniteQuery({
    queryKey: ['workflows', 'list', { infinite: true, limit: 10 }],
    queryFn: () => prefetchInfiniteWorkflowsList(10, cookieHeader),
    initialPageParam: undefined,
  })

  // Prefetch first page of executions for infinite query
  const executionsPrefetch = queryClient.prefetchInfiniteQuery({
    queryKey: ['executions', 'infinite', { limit: 10 }],
    queryFn: () => prefetchInfiniteExecutions(10, cookieHeader),
    initialPageParam: undefined,
  })

  await Promise.all([credentialPrefetch, workflowListPrefetch, executionsPrefetch])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DataBootStrap />
      {children}
    </HydrationBoundary>
  )
}
