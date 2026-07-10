'use client'

import { signInSchema, signUpSchema } from '@buzz8n/common/types'
import { apiClient, getApiErrorMessage } from '@/lib/api-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getQueryClient } from '@/utils/get-query-client'
import { toast } from '@buzz8n/ui/components/sonner'
import { useRouter } from 'nextjs-toploader/app'
import axios from 'axios'
import { z } from 'zod'

export interface User {
  id: string
  name: string
  email: string
}

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>

export interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (data: SignInFormData) => void
  signUp: (data: SignUpFormData) => void
  signOut: () => void
  isSigningIn: boolean
  isSigningUp: boolean
  isSigningOut: boolean
  signInError: string | null
  signUpError: string | null
}

const AUTH_QUERY_KEY = ['auth', 'user']

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = getQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await apiClient.get<User>('/me')
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const signInMutation = useMutation({
    mutationFn: async (formData: SignInFormData) => {
      const response = await apiClient.post('/signin', {
        email: formData.email,
        password: formData.password,
      })
      return response.data
    },
    onSuccess: async () => {
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl')
      router.push(callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard')
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      toast.success('Sign-in successful')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Sign-in failed. Please try again.'))
    },
  })

  const signUpMutation = useMutation({
    mutationFn: async (formData: SignUpFormData) => {
      const response = await apiClient.post('/signup', {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      })
      return response.data
    },
    onSuccess: () => {
      router.push('/signin')
      toast.success('Account created successfully! Please sign in.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Sign-up failed. Please try again.'))
    },
  })

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/signout', {})
      return response.data
    },
    onSuccess: async () => {
      router.push('/')
      toast.success('Signed out successfully')
      await queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Sign-out failed. Please try again.'))
    },
  })

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    signInError: signInMutation.error
      ? getApiErrorMessage(signInMutation.error, 'Sign-in failed. Try again')
      : null,
    signUpError: signUpMutation.error
      ? getApiErrorMessage(signUpMutation.error, 'Sign-up failed. Try again')
      : null,
  }
}
