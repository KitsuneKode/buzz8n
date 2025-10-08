import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import CredentialsBootstrap from '@/components/CredentialBootStrap'
import { getQueryClient } from '@/utils/get-query-client'
import { API_URL } from '@/utils/config'
import { cookies } from 'next/headers'
import axios from 'axios'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const cookieHeader = (await cookies()).toString()
  console.log('one time', cookieHeader)

  await queryClient.prefetchQuery({
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CredentialsBootstrap />
      {children}
    </HydrationBoundary>
  )
}
