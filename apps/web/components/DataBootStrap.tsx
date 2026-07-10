'use client'
import { CredentialsInfiniteResponse } from '@buzz8n/common/types'
import { useInfiniteCredentials } from '@/hooks/useCredentials'
import { useDashboardStore } from '@/stores/dashboard'
import { Credential } from '@/lib/types/credentials'
import { useEffect } from 'react'

/**
 * Syncs credential metadata into the dashboard store for workflow-editor selects.
 * Secrets are never included in list responses.
 */
export default function DataBootstrap() {
  const { data: infiniteData } = useInfiniteCredentials(10)

  useEffect(() => {
    if (infiniteData?.pages && infiniteData.pages.length > 0) {
      const allCredentials: Credential[] = infiniteData.pages.flatMap(
        (page: CredentialsInfiniteResponse) =>
          page.credentials.map((credential) => ({
            id: credential.id,
            name: credential.title,
            provider: credential.platform,
            createdAt: new Date(credential.createdAt),
          })),
      )

      useDashboardStore.setState({ credentials: allCredentials })
    }
  }, [infiniteData])

  return null
}
