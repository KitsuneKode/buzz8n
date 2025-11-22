'use client'

import {
  WorkflowResponse,
  WorkflowsListResponse,
  WorkflowsInfiniteResponse,
  ExecutionsInfiniteResponse,
  WorkflowListItem,
  CreateWorkflow,
  UpdateWorkflow,
  WorkflowListData,
  Execution,
} from '@buzz8n/common/types'

import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  UseQueryResult,
  UseInfiniteQueryResult,
  UseMutationResult,
  InfiniteData,
} from '@tanstack/react-query'
import { EdgeData, NodeData, WorkflowData } from '@/lib/types/workflow'
import { useWorkflowEditorStore } from '@/stores/workflow-editor'
import { toast } from '@buzz8n/ui/components/sonner'
import { useRouter } from 'nextjs-toploader/app'
import { useWebSocket } from './useWebSocket'
import { notFound } from 'next/navigation'
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
    status: response.status,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  }
}

/**
 * Loads a single workflow by its id and exposes React Query state.
 *
 * @param id - The workflow identifier; the query is disabled when `id` is falsy or equals `"new"`.
 * @returns The query result whose `data` is the workflow's data when available.
 */
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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
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
        // Invalidate workflows list (including infinite queries)
        queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() })
        queryClient.invalidateQueries({ queryKey: ['workflows', 'list', { infinite: true }] })

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
  activeChange?: boolean
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
    onSuccess: (workflow, { activeChange }) => {
      // Update cache

      queryClient.setQueryData(WORKFLOW_QUERY_KEYS.detail(workflow.id), workflow)

      // Invalidate workflows list (including infinite queries)
      queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ['workflows', 'list', { infinite: true }] })

      saveWorkflow(workflow)
      if (activeChange) {
        toast.success(
          workflow.active ? 'Workflow activated successfully' : 'Workflow deactivated successfully',
        )
      } else {
        toast.success('Workflow updated successfully')
      }
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

        // Invalidate workflows list (including infinite queries)
        queryClient.invalidateQueries({ queryKey: WORKFLOW_QUERY_KEYS.lists() })
        queryClient.invalidateQueries({ queryKey: ['workflows', 'list', { infinite: true }] })

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
  { payload: { executionId: string; workflowId: string } },
  Error,
  string, // ✅ argument type for mutate(),
  unknown
> {
  const { subscribe } = useWebSocket()
  const { setCurrentExecution } = useWorkflowEditorStore()

  return useMutation({
    mutationFn: async (
      id: string,
    ): Promise<{ payload: { executionId: string; workflowId: string } }> => {
      const response = await axios.post(
        `${API_URL}/workflow/${id}/execute`,
        {},
        {
          withCredentials: true,
        },
      )
      return response.data
    },

    onSuccess: ({ payload }) => {
      // Subscribe to WebSocket for real-time updates

      subscribe(payload.workflowId, payload.executionId)
      const execution: Execution = {
        id: payload.executionId,
        workflowId: payload.workflowId,
        status: 'loading',
        startedAt: new Date(),
        summary: 'Workflow execution started',
        logs: [],
      }
      setCurrentExecution(execution)

      toast.success('Workflow execution started')
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

// Server-side prefetch workflows list for infinite queries
export async function prefetchInfiniteWorkflowsList(
  limit: number = 10,
  cookieHeader?: string,
): Promise<WorkflowsInfiniteResponse> {
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

    const response = await axios.get<WorkflowsInfiniteResponse>(
      `${API_URL}/workflow?${params.toString()}`,
      config,
    )
    return response.data
  } catch {
    return { workflows: [], cursor: undefined, totalCount: 0 }
  }
}

// Server-side prefetch executions for infinite queries
export async function prefetchInfiniteExecutions(
  limit: number = 10,
  cookieHeader?: string,
): Promise<ExecutionsInfiniteResponse> {
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

    const response = await axios.get<ExecutionsInfiniteResponse>(
      `${API_URL}/execution?${params.toString()}`,
      config,
    )
    return response.data
  } catch {
    return { executions: [], cursor: undefined }
  }
}

// Fetch workflows list with infinite scrolling support
export function useInfiniteWorkflowsList(
  limit: number = 10,
): UseInfiniteQueryResult<InfiniteData<WorkflowsInfiniteResponse>, Error> {
  return useInfiniteQuery({
    queryKey: WORKFLOW_QUERY_KEYS.list({ infinite: true, limit }),
    queryFn: async ({ pageParam }): Promise<WorkflowsInfiniteResponse> => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (pageParam) params.append('cursor', pageParam as unknown as string)
      const response = await axios.get<WorkflowsInfiniteResponse>(
        `${API_URL}/workflow?${params.toString()}`,
        { withCredentials: true },
      )
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 2 * 60 * 1000,
  })
}
// Fetch executions for a workflow with infinite scrolling support
export function useInfiniteWorkflowExecutions(
  workflowId: string,
  limit: number = 10,
): UseInfiniteQueryResult<InfiniteData<ExecutionsInfiniteResponse>, Error> {
  return useInfiniteQuery({
    queryKey: ['workflows', 'executions', 'infinite', workflowId, { limit }],
    queryFn: async ({ pageParam }): Promise<ExecutionsInfiniteResponse> => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (pageParam) {
        params.append('cursor', pageParam)
      }

      const response = await axios.get<ExecutionsInfiniteResponse>(
        `${API_URL}/workflow/${workflowId}/executions?${params.toString()}`,
        {
          withCredentials: true,
        },
      )
      return response.data
    },
    getNextPageParam: (lastPage): string | undefined => lastPage.cursor || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!workflowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch all executions with infinite scrolling support
export function useInfiniteExecutions(
  limit: number = 10,
): UseInfiniteQueryResult<InfiniteData<ExecutionsInfiniteResponse>, Error> {
  return useInfiniteQuery({
    queryKey: ['executions', 'infinite', { limit }],
    queryFn: async ({ pageParam }): Promise<ExecutionsInfiniteResponse> => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (pageParam) {
        params.append('cursor', pageParam)
      }

      const response = await axios.get<ExecutionsInfiniteResponse>(
        `${API_URL}/execution?${params.toString()}`,
        {
          withCredentials: true,
        },
      )
      return response.data
    },
    getNextPageParam: (lastPage): string | undefined => lastPage.cursor || undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch executions for a workflow (legacy - kept for backward compatibility)
export function useWorkflowExecutions(
  workflowId: string,
  filters: { limit?: number; cursor?: string } = {},
): UseQueryResult<Execution[], Error> {
  return useQuery({
    queryKey: ['workflows', 'executions', workflowId, filters],
    queryFn: async (): Promise<Execution[]> => {
      const params = new URLSearchParams()
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.cursor) params.append('cursor', filters.cursor)

      const response = await axios.get<{ executions: Execution[] }>(
        `${API_URL}/workflow/${workflowId}/executions?${params.toString()}`,
        {
          withCredentials: true,
        },
      )
      return response.data.executions.map((execution) => ({
        ...execution,
        startedAt: new Date(execution.startedAt),
        finishedAt: execution.finishedAt ? new Date(execution.finishedAt) : undefined,
        logs: execution.logs.map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })),
      }))
    },
    enabled: !!workflowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch single execution details
export function useExecutionDetail(executionId: string): UseQueryResult<Execution, Error> {
  return useQuery({
    queryKey: ['executions', 'detail', executionId],
    queryFn: async (): Promise<Execution> => {
      const response = await axios.get<Execution>(`${API_URL}/execution/${executionId}`, {
        withCredentials: true,
      })
      const execution = response.data
      return {
        ...execution,
        startedAt: new Date(execution.startedAt),
        finishedAt: execution.finishedAt ? new Date(execution.finishedAt) : undefined,
        logs: execution.logs.map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })),
      }
    },
    enabled: !!executionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch the latest in-progress execution for a workflow
 * Used to resume execution monitoring when opening a workflow
 */
export function useLatestExecution(workflowId: string): UseQueryResult<Execution | null, Error> {
  return useQuery({
    queryKey: ['workflows', 'latest-execution', workflowId],
    queryFn: async (): Promise<Execution | null> => {
      const params = new URLSearchParams()
      params.append('limit', '1')

      const response = await axios.get<ExecutionsInfiniteResponse>(
        `${API_URL}/workflow/${workflowId}/executions?${params.toString()}`,
        { withCredentials: true },
      )

      const latestExecution = response.data.executions[0]

      // Only return if it's currently in-progress (loading status)
      console.log('Latest execution fetched:', latestExecution?.status)
      if (
        !latestExecution ||
        !(latestExecution.status === 'loading' || latestExecution.status === 'initial')
      ) {
        return null
      }

      // Transform dates
      return {
        ...latestExecution,
        startedAt: new Date(latestExecution.startedAt),
        finishedAt: latestExecution.finishedAt ? new Date(latestExecution.finishedAt) : undefined,
        logs: latestExecution.logs.map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })),
      }
    },
    enabled: !!workflowId,
    staleTime: 0, // Always fetch fresh on mount
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
