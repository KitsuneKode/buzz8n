'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { signInSchema, signUpSchema } from '@buzz8n/common/types'
import { toast } from '@buzz8n/ui/components/sonner'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { API_URL } from '@/utils/config'
import { z } from 'zod'

export interface User {
  id: string
  name: string
  email: string
}

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>

// Auth hook return type
export interface UseAuthReturn {
  // User state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Auth actions
  signIn: (data: SignInFormData) => void
  signUp: (data: SignUpFormData) => void
  signOut: () => void

  // Mutation states
  isSigningIn: boolean
  isSigningUp: boolean
  isSigningOut: boolean

  // Error states
  signInError: string | null
  signUpError: string | null
}

const AUTH_QUERY_KEY = ['auth', 'user']

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch current user profile
  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        })
        return response.data
      } catch (error) {
        // If unauthorized, user is not authenticated
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (formData: SignInFormData) => {
      const response = await axios.post(
        `${API_URL}/signin`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        },
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Sign-in successful')
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      router.push('/dashboard')
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Sign-in failed. Please try again.'
      toast.error(errorMessage)
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async (formData: SignUpFormData) => {
      const response = await axios.post(`${API_URL}/signup`, {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please sign in.')
      router.push('/sign-in')
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Sign-up failed. Please try again.'
      toast.error(errorMessage)
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_URL}signout`, {
        withCredentials: true,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      // Clear user data from cache
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
      router.push('/sign-in')
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Sign-out failed. Please try again.'
      toast.error(errorMessage)
    },
  })

  return {
    // User state
    user: user || null,
    isAuthenticated: !!user,
    isLoading,

    // Auth actions
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,

    // Mutation states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,

    // Error states
    signInError: signInMutation.error
      ? ((signInMutation.error as AxiosError).response?.data as string) ||
        'Sign-in failed. Try again'
      : null,
    signUpError: signUpMutation.error
      ? ((signUpMutation.error as AxiosError).response?.data as string) ||
        'Sign-up failed. Try again'
      : null,
  }
}
