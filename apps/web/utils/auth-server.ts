import { redirect } from 'next/navigation'
import { API_URL } from '@/utils/config'
import { cookies } from 'next/headers'
import axios from 'axios'

export interface User {
  id: string
  name: string
  email: string
}

/**
 * Get the current user from the server side
 * Server Components Only
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()

    if (!cookieStore) {
      console.log('no cookies')
      return null
    }
    const authToken = cookieStore?.get('buzz8n_auth')?.value

    if (!authToken) {
      return null
    }

    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Cookie: cookieStore.toString(),

        cache: 'no-store',
      },
    })

    if (!response.data) {
      return null
    }

    const user: User = response.data
    return user
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to get current user:', error.message)
      return null
    }

    console.error(error)
    return null
  }
}

export async function requireAuth(callbackUrl?: string): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    const signInUrl = callbackUrl
      ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/signin'
    redirect(signInUrl)
  }

  return user
}
