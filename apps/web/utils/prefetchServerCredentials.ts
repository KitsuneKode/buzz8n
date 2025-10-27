import { CredentialsInfiniteResponse } from '@buzz8n/common/types'
import { API_URL } from '@/utils/config'
import axios from 'axios'

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
