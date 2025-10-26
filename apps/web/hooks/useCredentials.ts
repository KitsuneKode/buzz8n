'use client'

import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query'
import { CredentialsInfiniteResponse } from '@buzz8n/common/types'
import { API_URL } from '@/utils/config'
import axios from 'axios'

/**
 * Fetches credentials with infinite scrolling support
 * @param limit - Number of credentials per page (default: 10)
 * @returns Infinite query result with flattened credentials array
 */
export function useInfiniteCredentials(
  limit: number = 10,
): UseInfiniteQueryResult<InfiniteData<CredentialsInfiniteResponse>, Error> {
  return useInfiniteQuery({
    queryKey: ['credentials', 'infinite', { limit }],
    queryFn: async ({ pageParam }): Promise<CredentialsInfiniteResponse> => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (pageParam) {
        params.append('cursor', pageParam)
      }

      const response = await axios.get<CredentialsInfiniteResponse>(
        `${API_URL}/credential?${params.toString()}`,
        {
          withCredentials: true,
        },
      )
      return response.data
    },
    getNextPageParam: (lastPage): string | undefined => lastPage.cursor || undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Server-side prefetch credentials list for infinite queries
export async function prefetchInfiniteCredentials(
  limit: number = 10,
  cookieHeader?: string,
): Promise<CredentialsInfiniteResponse> {
  try {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())

    let config
    if (cookieHeader) {
      config = {
        headers: {
          Cookie: cookieHeader,
        },
      }
    } else {
      config = {
        withCredentials: true,
      }
    }

    const response = await axios.get<CredentialsInfiniteResponse>(
      `${API_URL}/credential?${params.toString()}`,
      config,
    )
    return response.data
  } catch {
    return { credentials: [], cursor: undefined }
  }
}
