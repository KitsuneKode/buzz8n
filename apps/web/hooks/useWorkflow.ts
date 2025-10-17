'use client'

import {
  WorkflowResponse,
  WorkflowsListResponse,
  WorkflowListItem,
  CreateWorkflow,
  UpdateWorkflow,
  WorkflowListData,
  updateWorkflowSchema,
} from '@buzz8n/common/types'

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query'
import { EdgeData, NodeData, WorkflowData } from '@/lib/types/workflow'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { notFound, useRouter } from 'next/navigation'
import { toast } from '@buzz8n/ui/components/sonner'
import axios, { AxiosError } from 'axios'
import { API_URL } from '@/utils/config'
import { useTransition } from 'react'

// Query Keys
export const WORKFLOW_QUERY_KEYS = {
  all: ['workflows'] as const,
  lists: () => [...WORKFLOW_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...WORKFLOW_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...WORKFLOW_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WORKFLOW_QUERY_KEYS.details(), id] as const,
} as const

// Transform API response to frontend format
const transformWorkflowResponse = (response: WorkflowResponse): WorkflowData => {
  return {
    id: response.id,
    name: response.name,
    active: response.active,
    nodes: response.nodes as unknown as NodeData[], // Will be properly typed by React Flow
    edges: response.edges as unknown as EdgeData[], // Will be properly typed by React Flow
    userId: response.userId,
    archived: response.archived,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  }
}

// Transform workflow list item response
const transformWorkflowListItem = (response: WorkflowListItem): WorkflowListData => {
  return {
    id: response.id,
    name: response.name,
    active: response.active,
    userId: response.userId,

    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  }
}

// Fetch single workflow
export function useWorkflow(id: string): UseQueryResult<WorkflowData, Error> {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.detail(id),
    queryFn: async (): Promise<WorkflowData> => {
      const response = await axios.get<WorkflowResponse>(`${API_URL}/workflow/${id}`, {
        withCredentials: true,
      })
      return transformWorkflowResponse(response.data)
    },
    enabled: !!id && id !== 'new',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch workflows list (lightweight)
export function useWorkflowsList(
  filters: { page?: number; limit?: number } = {},
): UseQueryResult<WorkflowListData[], Error> {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<WorkflowListData[]> => {
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      // if (filters.archived !== undefined) params.append('archived', filters.archived.toString())

      const response = await axios.get<WorkflowsListResponse>(
        `${API_URL}/workflow?${params.toString()}`,
        {
          withCredentials: true,
        },
      )
      return response.data.workflows.map(transformWorkflowListItem)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Create workflow mutation
export function useCreateWorkflow(): UseMutationResult<
  WorkflowData,
  Error,
  CreateWorkflow,
  unknown
> {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [, startTransition] = useTransition()

  return useMutation({
    mutationFn: async (data: CreateWorkflow): Promise<WorkflowData> => {
      const response = await axios.post<WorkflowResponse>(`${API_URL}/workflow`, data, {
        withCredentials: true,
      })
      return transformWorkflowResponse(response.data)
    },
    onSuccess: (workflow) => {
      startTransition(() => {
        // Invalidate workflows list
        queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() })

        // Add to cache
        queryClient.setQueryData(WORKFLOW_QUERY_KEYS.detail(workflow.id), workflow)

        toast.success('Workflow created successfully')
        router.push(`/workflow/${workflow.id}`)
      })
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Failed to create workflow'
      toast.error(errorMessage)
    },
  })
}

type UpdateWorkflowArgs = {
  id: string
  data: UpdateWorkflow
}
// Update workflow mutation
export function useUpdateWorkflow(): UseMutationResult<
  WorkflowData,
  Error,
  UpdateWorkflowArgs,
  unknown
> {
  const queryClient = useQueryClient()
  const { saveWorkflow } = useWorkflowEditorStore()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateWorkflowArgs): Promise<WorkflowData> => {
      const response = await axios.put<WorkflowResponse>(`${API_URL}/workflow/${id}`, data, {
        withCredentials: true,
      })
      return transformWorkflowResponse(response.data)
    },
    onSuccess: (workflow) => {
      // Update cache

      queryClient.setQueryData(WORKFLOW_QUERY_KEYS.detail(workflow.id), workflow)

      // Invalidate workflows list
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() })

      saveWorkflow(workflow)
      toast.success('Workflow updated successfully')
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Failed to update workflow'

      toast.error(errorMessage)
    },
  })
}

// Delete workflow mutation
export function useDeleteWorkflow(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [, startTransition] = useTransition()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${API_URL}/workflow/${id}`, {
        withCredentials: true,
      })
    },
    onSuccess: (_, id) => {
      startTransition(() => {
        // Remove from cache
        queryClient.removeQueries({ queryKey: WORKFLOW_QUERY_KEYS.detail(id) })

        // Invalidate workflows list
        queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() })

        toast.success('Workflow deleted successfully')
        router.push('/dashboard')
      })
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Failed to delete workflow'
      toast.error(errorMessage)
    },
  })
}

// Execute workflow mutation
export function useExecuteWorkflow(): UseMutationResult<
  { executionId: string },
  Error,
  string, // ✅ argument type for mutate(),
  unknown
> {
  return useMutation({
    mutationFn: async (id: string): Promise<{ executionId: string }> => {
      const response = await axios.post<{ executionId: string }>(
        `${API_URL}/workflow/${id}/execute`,
        {},
        {
          withCredentials: true,
        },
      )
      return response.data
    },

    onSuccess: () => {
      toast.success('Workflow execution started')
      // Could trigger a query to fetch execution status
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as string) || 'Failed to execute workflow'
      toast.error(errorMessage)
    },
  })
}

// Server-side prefetch function
export async function prefetchWorkflow(
  id: string,
  cookieHeader?: string,
): Promise<WorkflowData | null> {
  try {
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

    const response = await axios.get<WorkflowResponse>(`${API_URL}/workflow/${id}`, config)
    return transformWorkflowResponse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound()
    }
    notFound()
    return null
  }
}

// Server-side prefetch workflows list
export async function prefetchWorkflowsList(
  filters: { page?: number; limit?: number; archived?: boolean } = {},
  cookieHeader?: string,
): Promise<WorkflowListData[]> {
  try {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    // if (filters.archived !== undefined) params.append('archived', filters.archived.toString())

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
    const response = await axios.get<WorkflowsListResponse>(
      `${API_URL}/workflow?${params.toString()}`,
      config,
    )
    return response.data.workflows.map(transformWorkflowListItem)
  } catch {
    return []
  }
}
