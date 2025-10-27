'use client'
import { CredentialsInfiniteResponse } from '@buzz8n/common/types'
import { useInfiniteCredentials } from '@/hooks/useCredentials'
import { useDashboardStore } from '@/stores/dashboard'
import { Credential } from '@/lib/types/credentials'
import { useEffect } from 'react'

/**
 * Fetches credential data on the client, maps it into local `Credential` objects, and stores them in the dashboard store.
 *
 * On failure, logs an error to the console. This component does not render any UI.
 *
 * @returns `null` (renders nothing)
 */
export default function DataBootstrap() {
  // Use infinite credentials query to get initial data
  const { data: infiniteData } = useInfiniteCredentials(10)

  useEffect(() => {
    if (infiniteData?.pages && infiniteData.pages.length > 0) {
      // Flatten all pages and transform to frontend format
      const allCredentials = infiniteData.pages.flatMap((page: CredentialsInfiniteResponse) =>
        page.credentials.map((credential) => ({
          config: credential.data,
          id: credential.id,
          name: credential.title,
          provider: credential.platform,
          createdAt: new Date(credential.createdAt),
        })),
      )

      // Only store the first 10 credentials in the dashboard store for backward compatibility
      const firstPageCredentials: Credential[] = allCredentials.slice(0, 10)
      useDashboardStore.setState({ credentials: firstPageCredentials })
    }
  }, [infiniteData])

  return null
}
