import { z } from 'zod'

// Node types enum
export const nodeTypeSchema = z.enum([
  'manualTrigger',
  'telegramSendMessage',
  'emailSend',
  'webhook',
  'aiAgent',
  'formSubmission',
  'chatMessage',
  'exponent',
  'sum',
  'multiply',
  'other',
])

// Execution status enum
export const executionStatusSchema = z.enum(['initial', 'loading', 'success', 'error'])

export const credentialRefSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
})

// Node data schema

export const nodeDataSchema = z
  .object({
    label: z.string(),
    type: nodeTypeSchema,
    description: z.string().optional(),
    category: z.string().optional(),
    config: z.record(z.string(), z.any()),
    credentials: credentialRefSchema.optional(),
    status: executionStatusSchema.optional(),
    requiredCredentials: z.array(z.string()).optional(),
  })
  .catchall(z.any())

// Edge schema
export const edgeSchema = z
  .looseObject({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional().nullish(),
    targetHandle: z.string().optional().nullish(),
  })
  .catchall(z.any())

//Node schema
export const nodeSchema = z
  .looseObject({
    id: z.string(),
    data: nodeDataSchema,
  })
  .catchall(z.any())

export const nodesSchema = z.array(nodeSchema)
export const edgesSchema = z.array(edgeSchema)

// Base workflow schema matching Prisma model
export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: nodesSchema,
  edges: edgesSchema, // Json array
  userId: z.string(),
  archived: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Workflow creation schema (without id, timestamps)
export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  active: z.boolean().optional().default(false),
  nodes: nodesSchema.default([]).optional(),
  edges: edgesSchema.default([]).optional(),
})

// Node template schema
export const nodeTemplateSchema = z.object({
  id: z.string(),
  type: nodeTypeSchema,
  label: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.string(),
  defaultConfig: z.record(z.string(), z.any()),
  requiredCredentials: z.array(z.string()).optional(),
})

// Execution schema
export const executionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  workflow: z
    .object({
      id: z.string(),
      name: z.string(),
      active: z.boolean(),
    })
    .optional(),
  status: executionStatusSchema,
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  durationMs: z.number().optional(),
  summary: z.string().optional(),
  logs: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['execution_complete', 'node_event']),
      timestamp: z.date(),
      nodeId: z.string(),
      status: z.enum(['loading', 'success', 'error']),
      level: z.enum(['info', 'warn', 'error', 'debug']),
      executionSummary: z.string().optional(),
      message: z.string(),
      context: z
        .object({
          input: z.any().optional(),
          output: z.any().optional(),
          error: z.any().optional(),
          duration: z.number().optional(),
          retryCount: z.number().optional(),
        })
        .optional(),
      metadata: z
        .object({
          userId: z.string().optional(),
          workflowId: z.string().optional(),
          executionId: z.string().optional(),
        })
        .optional(),
    }),
  ),
})

// Workflow update schema (partial)
export const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  nodes: nodesSchema.optional(),
  edges: edgesSchema.optional(),
})

// API Response schemas
export const workflowResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: nodesSchema,
  edges: edgesSchema,
  status: executionStatusSchema,
  userId: z.string(),
  archived: z.boolean(),
  createdAt: z.string(), // ISO string from API
  updatedAt: z.string(), // ISO string from API
})

// Lightweight workflow schema for list view (without nodes/edges)
export const workflowListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  status: executionStatusSchema,
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const workflowsListResponseSchema = z.object({
  workflows: z.array(workflowListItemSchema),
  cursor: z.string().optional(),
})

// Infinite query response schemas (cursor-based pagination)
export const workflowsInfiniteResponseSchema = z.object({
  workflows: z.array(workflowListItemSchema),
  cursor: z.string().optional(),
  totalCount: z.number(),
})

export const executionsInfiniteResponseSchema = z.object({
  executions: z.array(executionSchema),
  cursor: z.string().optional(),
})

// Type exports
export type Workflow = z.infer<typeof workflowSchema>
export type CreateWorkflow = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflow = z.infer<typeof updateWorkflowSchema>
export type NodeType = z.infer<typeof nodeTypeSchema>
export type ExecutionStatus = z.infer<typeof executionStatusSchema>
// export type NodeDataZodType = z.infer<typeof nodeDataSchema>
// export type EdgeData = z.infer<typeof edgeDataSchema>
export type NodeTemplate = z.infer<typeof nodeTemplateSchema>
export type Execution = z.infer<typeof executionSchema>
export type WorkflowResponse = z.infer<typeof workflowResponseSchema>
export type WorkflowListItem = z.infer<typeof workflowListItemSchema>
export type WorkflowsListResponse = z.infer<typeof workflowsListResponseSchema>
export type WorkflowsInfiniteResponse = z.infer<typeof workflowsInfiniteResponseSchema>
export type ExecutionsInfiniteResponse = z.infer<typeof executionsInfiniteResponseSchema>

// Frontend-specific types (extended for React Flow)
// export interface WorkflowData extends Omit<Workflow, 'nodes' | 'edges'> {
//   nodes: NodeData[]
//   edges: EdgeData[]
// }

export interface WorkflowListData extends Omit<WorkflowListItem, 'createdAt' | 'updatedAt'> {
  createdAt: Date
  updatedAt: Date
}

export type CredentialRef = z.infer<typeof credentialRefSchema>

export interface ExecutionLog {
  id: string
  type: 'execution_complete' | 'node_event'
  timestamp: Date
  nodeId: string
  status: 'loading' | 'success' | 'error'
  level: 'debug' | 'info' | 'warn' | 'error'
  executionSummary?: string
  message: string
  context?: {
    input?: any
    output?: any
    error?: any
    duration?: number
    retryCount?: number
  }
  metadata?: {
    userId?: string
    workflowId?: string
    executionId?: string
  }
}

export interface NodeCategory {
  id: string
  label: string
  nodes: NodeTemplate[]
}

// export const workflowEventSchema = z.object({
//   type: z.enum(['subscribe', 'unsubscribe']),
//   workflowId: z.string(),
//   executionId: z.string().optional(),
// })

// export type WorkflowEvent = z.infer<typeof workflowEventSchema>

// WebSocket message types for type safety
export const subscribeMessageType = z.object({
  type: z.literal('subscribe'),
  workflowId: z.string(),
  executionId: z.string(),
})

export const unsubscribeMessageType = z.object({
  type: z.literal('unsubscribe'),
})

export const webSocketMessageSchema = z.discriminatedUnion('type', [
  subscribeMessageType,
  unsubscribeMessageType,
])

export type WebSocketMessage = z.infer<typeof webSocketMessageSchema>

// Execution completion event
export const executionCompleteSchema = z.object({
  type: z.literal('execution_complete'),
  executionId: z.string(),
  status: executionStatusSchema,
  timestamp: z.date(),
})

export type ExecutionComplete = z.infer<typeof executionCompleteSchema>
