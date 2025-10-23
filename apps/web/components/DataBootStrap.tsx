'use client'
import { CredentialResponse } from '@buzz8n/common/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDashboardStore } from '@/stores/dashboard'
import { Credential } from '@/lib/types/credentials'
import { API_URL } from '@/utils/config'
import { useEffect } from 'react'
import axios from 'axios'

/**
 * Fetches credential data on the client, maps it into local `Credential` objects, and stores them in the dashboard store.
 *
 * On failure, logs an error to the console. This component does not render any UI.
 *
 * @returns `null` (renders nothing)
 */
export default function DataBootstrap() {
  const { data: initialCredentials } = useSuspenseQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/credential`, {
        withCredentials: true,
      })

      return response.data.credentials
    },
  })

  useEffect(() => {
    if (initialCredentials) {
      const credentials: Credential[] = initialCredentials.map(
        (credential: CredentialResponse) => ({
          config: credential.data,
          id: credential.id,
          name: credential.title,
          provider: credential.platform,
          createdAt: new Date(credential.createdAt),
        }),
      )
      useDashboardStore.setState({ credentials })
    }
  }, [initialCredentials])

  return null
}
