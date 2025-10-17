import { CredentialRef, ExecutionStatus, NodeType, Workflow } from '@buzz8n/common/types/workflow'
import type { Node, Edge } from '@xyflow/react'
export type {
  CredentialRef,
  NodeType,
  ExecutionStatus,
  Execution,
  ExecutionLog,
  NodeCategory,
  NodeTemplate,
} from '@buzz8n/common/types'

export interface WorkflowData extends Workflow {
  id: string
  name: string
  nodes: NodeData[]
  edges: EdgeData[]
  createdAt: Date
  updatedAt: Date
  active: boolean
}

export interface NodeData extends Node {
  [key: string]: any
  data: {
    label: string
    type: NodeType
    description?: string
    config: Record<string, any>
    credentials?: CredentialRef
    status?: ExecutionStatus
    [key: string]: any
  }
}

export interface EdgeData extends Edge {
  // Additional edge properties can be added here
}
