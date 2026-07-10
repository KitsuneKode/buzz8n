'use client'

import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query'
import { CredentialsInfiniteResponse } from '@buzz8n/common/types'
import { apiClient } from '@/lib/api-client'

/**
 * Fetches credentials with infinite scrolling support.
 * List responses never include secret `data` payloads.
 */
export function useInfiniteCredentials(
  limit: number = 10,
  options?: { enabled?: boolean },
): UseInfiniteQueryResult<InfiniteData<CredentialsInfiniteResponse>, Error> {
  return useInfiniteQuery({
    queryKey: ['credentials', 'infinite', { limit }],
    queryFn: async ({ pageParam }): Promise<CredentialsInfiniteResponse> => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (pageParam) {
        params.append('cursor', pageParam)
      }

      const response = await apiClient.get<CredentialsInfiniteResponse>(
        `/credential?${params.toString()}`,
      )
      return response.data
    },
    getNextPageParam: (lastPage): string | undefined => lastPage.cursor || undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  })
}
