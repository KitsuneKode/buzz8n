import { Node, Edge } from '@xyflow/react'

export interface WorkflowData {
  id: string
  name: string
  nodes: NodeData[]
  edges: EdgeData[]
  createdAt: Date
  updatedAt: Date
  active: boolean
}

export interface NodeData extends Node {
  data: {
    label: string
    type: NodeType
    config: Record<string, any>
    credentials?: CredentialRef
    status?: ExecutionStatus
    [key: string]: any
  }
}

export interface EdgeData extends Edge {
  // Additional edge properties can be added here
}

export interface CredentialRef {
  id: string
  name: string
  provider: string
}

export type NodeType =
  | 'manualTrigger'
  | 'telegramGetChat'
  | 'emailSend'
  | 'webhook'
  | 'schedule'
  | 'appEvent'
  | 'formSubmission'
  | 'executedByWorkflow'
  | 'chatMessage'
  | 'evaluation'
  | 'other'

export type ExecutionStatus = 'initial' | 'loading' | 'success' | 'error'

export interface Execution {
  id: string
  workflowId: string
  status: ExecutionStatus
  startedAt: Date
  finishedAt?: Date
  durationMs?: number
  summary: string
  logs: ExecutionLog[]
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

export interface NodeTemplate {
  id: string
  type: NodeType
  label: string
  description: string
  icon: string
  category: string
  defaultConfig: Record<string, any>
  requiredCredentials?: string[]
}
