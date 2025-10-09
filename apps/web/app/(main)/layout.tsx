import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { prefetchWorkflowsList } from '@/hooks/useWorkflow'
import { getQueryClient } from '@/utils/get-query-client'
import DataBootStrap from '@/components/DataBootStrap'
import { API_URL } from '@/utils/config'
import { cookies } from 'next/headers'
import axios from 'axios'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const cookieHeader = (await cookies()).toString()

  const credentialPrefetch = queryClient.prefetchQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_URL}/credential`, {
          headers: {
            Cookie: cookieHeader, // Add this line
          },
        })
        return response.data.credentials
      } catch {
        return []
      }
    },
  })

  const workflowListPrefetch = queryClient.prefetchQuery({
    queryKey: ['workflows', 'list', { filters: { limit: 20 } }],
    queryFn: () =>
      prefetchWorkflowsList(
        {
          limit: 20,
        },
        cookieHeader,
      ),
  })

  await Promise.all([credentialPrefetch, workflowListPrefetch])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DataBootStrap />
      {children}
    </HydrationBoundary>
  )
}
