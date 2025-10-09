'use client'
import { CredentialResponse } from '@buzz8n/common/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDashboardStore } from '@/stores/dashboard'
import { Credential } from '@/lib/types/credentials'
import { API_URL } from '@/utils/config'
import { useEffect } from 'react'
import axios from 'axios'

export default function DataBootstrap() {
  const {
    data: initialCredentials,
    isLoading,
    error,
    isError,
  } = useSuspenseQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/credential`, {
        withCredentials: true,
      })

      console.log(response.data.credentials)
      return response.data.credentials
    },
  })

  useEffect(() => {
    if (initialCredentials && !isLoading && !isError) {
      console.log('Credentials fetched successfully:', initialCredentials)

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
    if (isError) {
      console.error('Failed to fetch credentials', error)
    }
  }, [initialCredentials, isLoading, isError, error])

  return null
}
