import { string, z } from 'zod'

// Base workflow schema matching Prisma model
export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: z.array(z.record(z.string(), z.any())), // Json array
  edges: z.array(z.record(z.string(), z.any())), // Json array
  userId: z.string(),
  archived: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Workflow creation schema (without id, timestamps)
export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  active: z.boolean().default(false),
  // nodes: z.array(z.record(z.string(), z.any())).default([]),
  // edges: z.array(z.record(z.string(), z.any())).default([]),
})

// Workflow update schema (partial)
export const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  active: z.boolean().optional(),
  nodes: z.array(z.record(z.string(), z.any())).optional(),
  edges: z.array(z.record(z.string(), z.any())).optional(),
})

// Node types enum
export const nodeTypeSchema = z.enum([
  'manualTrigger',
  'telegramSendMessage',
  'emailSend',
  'webhook',
  'schedule',
  'appEvent',
  'formSubmission',
  'executedByWorkflow',
  'chatMessage',
  'evaluation',
  'other',
])

// Execution status enum
export const executionStatusSchema = z.enum(['initial', 'loading', 'success', 'error'])

// Node data schema
export const nodeDataSchema = z.object({
  label: z.string(),
  type: nodeTypeSchema,
  description: z.string().optional(),
  config: z.record(z.string(), z.any()),
  credentials: z
    .object({
      id: z.string(),
      name: z.string(),
      provider: z.string(),
    })
    .optional(),
  status: executionStatusSchema.optional(),
})

// Edge data schema
export const edgeDataSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
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
  status: executionStatusSchema,
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  durationMs: z.number().optional(),
  summary: z.string(),
  logs: z.array(
    z.object({
      id: z.string(),
      timestamp: z.date(),
      nodeId: z.string(),
      level: z.enum(['info', 'warn', 'error', 'debug']),
      message: z.string(),
      data: z.any().optional(),
    }),
  ),
})

// API Response schemas
export const workflowResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: z.array(z.record(z.string(), z.any())),
  edges: z.array(z.record(z.string(), z.any())),
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
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const workflowsListResponseSchema = z.object({
  workflows: z.array(workflowListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

// Type exports
export type Workflow = z.infer<typeof workflowSchema>
export type CreateWorkflow = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflow = z.infer<typeof updateWorkflowSchema>
export type NodeType = z.infer<typeof nodeTypeSchema>
export type ExecutionStatus = z.infer<typeof executionStatusSchema>
// export type NodeData = z.infer<typeof nodeDataSchema>
// export type EdgeData = z.infer<typeof edgeDataSchema>
export type NodeTemplate = z.infer<typeof nodeTemplateSchema>
export type Execution = z.infer<typeof executionSchema>
export type WorkflowResponse = z.infer<typeof workflowResponseSchema>
export type WorkflowListItem = z.infer<typeof workflowListItemSchema>
export type WorkflowsListResponse = z.infer<typeof workflowsListResponseSchema>

// Frontend-specific types (extended for React Flow)
// export interface WorkflowData extends Omit<Workflow, 'nodes' | 'edges'> {
//   nodes: NodeData[]
//   edges: EdgeData[]
// }

export interface WorkflowListData extends Omit<WorkflowListItem, 'createdAt' | 'updatedAt'> {
  createdAt: Date
  updatedAt: Date
}

export interface CredentialRef {
  id: string
  name: string
  provider: string
}

export interface ExecutionLog {
  id: string
  timestamp: Date
  nodeId: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: any
}

export interface NodeCategory {
  id: string
  label: string
  nodes: NodeTemplate[]
}
