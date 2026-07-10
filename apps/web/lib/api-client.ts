import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { API_URL } from '@/utils/config'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname
      if (!path.startsWith('/signin') && !path.startsWith('/signup')) {
        window.location.assign('/signin')
      }
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      return data.error
    }
    if (typeof data === 'string' && data.length > 0) {
      return data
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
