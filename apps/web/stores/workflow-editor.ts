import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react'

import {
  NodeData,
  EdgeData,
  WorkflowData,
  Execution,
  ExecutionLog,
  NodeTemplate,
  CredentialRef,
} from '@/lib/types/workflow'
import { create } from 'zustand'

interface WorkflowEditorState {
  // Current workflow
  workflow: WorkflowData | null
  isDirty: boolean
  isSaving: boolean
  // Canvas state
  nodes: NodeData[]
  edges: EdgeData[]
  selectedNodes: string[]
  selectedEdges: string[]
  pendingConnectFromNodeId: string | null

  // UI state
  activeTab: 'editor' | 'executions' | 'evaluations'
  isNodePaletteOpen: boolean
  isLogsDrawerOpen: boolean
  isPropertiesPanelOpen: boolean
  selectedNodeId: string | null

  // Execution state
  isExecuting: boolean
  currentExecution: Execution | null
  executionHistory: Execution[]

  // Actions
  startSaving: () => void
  setWorkflow: (workflow: WorkflowData) => void
  setActiveTab: (tab: 'editor' | 'executions' | 'evaluations') => void

  // Canvas actions
  onNodesChange: (changes: NodeChange<NodeData>[]) => void
  onEdgesChange: (changes: EdgeChange<EdgeData>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (template: NodeTemplate, position: { x: number; y: number }) => void
  addNodeWithEdge: (
    prevNodeId: string,
    template: NodeTemplate,
    position: { x: number; y: number },
  ) => void
  deleteSelectedNodes: () => void
  selectNode: (nodeId: string | null) => void
  deleteNode: (nodeId: string) => void
  updateSelectedNodeConfig: (patch: Record<string, unknown>) => void
  setSelectedNodeCredentialRef: (credential: CredentialRef | null) => void
  resendEmail: (nodeId: string) => Promise<void>

  // UI actions
  toggleNodePalette: () => void
  toggleLogsDrawer: () => void
  togglePropertiesPanel: () => void
  openNodePaletteFor: (nodeId: string) => void
  clearPendingConnect: () => void
  closeRightPanel: () => void

  // Workflow actions
  saveWorkflow: (updatedWorkflow: WorkflowData) => void
  executeWorkflow: () => void
  stopExecution: () => void

  // Execution actions
  addExecutionLog: (log: Omit<ExecutionLog, 'id'>) => void
  clearLogs: () => void
}

// Sample node templates
const nodeTemplates: NodeTemplate[] = [
  {
    id: 'manual-trigger',
    type: 'manualTrigger',
    label: 'Trigger manually',
    description: 'Runs the flow by clicking a button in n8n. Good for getting started quickly.',
    icon: '▶️',
    category: 'triggers',
    defaultConfig: {},
  },
  {
    id: 'telegram-send-message',
    type: 'telegramSendMessage',
    label: 'Send a message',
    description: 'Send a message through Telegram',
    icon: '💬',
    category: 'app-event',
    defaultConfig: {
      chatId: '',
      message: '',
    },
    requiredCredentials: ['telegram'],
  },
  {
    id: 'email-send',
    type: 'emailSend',
    label: 'Send email',
    description: 'Send an email message',
    icon: '📧',
    category: 'other',
    defaultConfig: {
      to: '',
      subject: '',
      body: '',
    },
    requiredCredentials: ['email'],
  },
]

export const useWorkflowEditorStore = create<WorkflowEditorState>((set, get) => ({
  // Initial state
  workflow: null,
  isDirty: false,
  isSaving: false,
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  activeTab: 'editor',
  isNodePaletteOpen: true,
  isLogsDrawerOpen: false,
  isPropertiesPanelOpen: false,
  selectedNodeId: null,
  isExecuting: false,
  currentExecution: null,
  executionHistory: [],
  pendingConnectFromNodeId: null,

  // Workflow actions
  setWorkflow: (workflow) =>
    set({
      workflow,
      nodes: workflow.nodes,
      edges: workflow.edges,
      isDirty: false,
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Canvas actions
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: true,
    }))
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }))
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
      isDirty: true,
    }))
  },

  addNodeWithEdge: (prevNodeId, template, position) => {
    const newNode: NodeData = {
      id: `node_${Date.now()}`,
      type: template.type,
      position,
      data: {
        label: template.label,
        type: template.type,
        description: template.description,
        config: { ...template.defaultConfig },
        status: 'initial',
      },
    }

    const newEdge: EdgeData = {
      id: `${prevNodeId}-${newNode.id}`,
      source: prevNodeId,
      target: newNode.id,
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge],
      isDirty: true,
      isNodePaletteOpen: false,
      pendingConnectFromNodeId: null,
      selectedNodeId: newNode.id,
    }))
  },
  addNode: (template, position) => {
    const newNode: NodeData = {
      id: `node_${Date.now()}`,
      type: template.type,
      position,
      data: {
        label: template.label,
        type: template.type,
        description: template.description,
        config: { ...template.defaultConfig },
        status: 'initial',
      },
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
      // When adding from the palette or toolbar, close the palette and open properties for the new node
      isNodePaletteOpen: false,
      selectedNodeId: newNode.id,
    }))
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      isDirty: true,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }))
  },

  deleteSelectedNodes: () => {
    const { selectedNodes } = get()
    if (selectedNodes.length === 0) return

    set((state) => ({
      nodes: state.nodes.filter((node) => !selectedNodes.includes(node.id)),
      edges: state.edges.filter(
        (edge) => !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target),
      ),
      selectedNodes: [],
      isDirty: true,
    }))
  },

  selectNode: (nodeId) =>
    set((state) => ({
      selectedNodeId: nodeId,
      // Only close the palette when a node is selected; keep it as-is on deselect
      isNodePaletteOpen: nodeId ? false : state.isNodePaletteOpen,
    })),

  // UI actions
  toggleNodePalette: () =>
    set((state) => ({
      isNodePaletteOpen: !state.isNodePaletteOpen,
    })),

  toggleLogsDrawer: () =>
    set((state) => ({
      isLogsDrawerOpen: !state.isLogsDrawerOpen,
    })),

  togglePropertiesPanel: () =>
    set((state) => ({
      isPropertiesPanelOpen: !state.isPropertiesPanelOpen,
    })),

  openNodePaletteFor: (
    nodeId: string, // NEW
  ) => set({ isNodePaletteOpen: true, pendingConnectFromNodeId: nodeId, selectedNodeId: nodeId }),

  clearPendingConnect: () => set({ pendingConnectFromNodeId: null }),

  startSaving: () => set({ isSaving: true }),

  closeRightPanel: () =>
    set({
      isNodePaletteOpen: false,
      selectedNodeId: null,
      // pendingConnectFromNodeId: null,
    }),

  // Workflow actions
  saveWorkflow: (updatedWorkflow) => {
    set({
      workflow: updatedWorkflow,
      isSaving: false,
      isDirty: false,
    })
  },

  executeWorkflow: async () => {
    const { nodes, workflow } = get()
    if (!workflow || nodes.length === 0) return

    const execution: Execution = {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: 'loading',
      startedAt: new Date(),
      summary: 'Workflow execution started',
      logs: [],
    }

    set({
      isExecuting: true,
      currentExecution: execution,
      executionHistory: [execution, ...get().executionHistory],
    })

    // Simulate execution
    for (const node of nodes) {
      // Update node status
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'loading' } } : n,
        ),
      }))

      // Add log
      get().addExecutionLog({
        timestamp: new Date(),
        nodeId: node.id,
        level: 'info',
        message: `Executing node: ${node.data.label}`,
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update node status to success
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'success' } } : n,
        ),
      }))
    }

    // Complete execution
    const finishedAt = new Date()
    const durationMs = finishedAt.getTime() - execution.startedAt.getTime()

    set((state) => ({
      isExecuting: false,
      currentExecution: state.currentExecution
        ? {
            ...state.currentExecution,
            status: 'success',
            finishedAt,
            durationMs,
            summary: `Workflow completed successfully in ${durationMs}ms`,
          }
        : null,
    }))
  },

  stopExecution: () => {
    set({ isExecuting: false })
  },

  // Execution actions
  addExecutionLog: (logData) => {
    const log: ExecutionLog = {
      id: `log_${Date.now()}`,
      ...logData,
    }

    set((state) => ({
      currentExecution: state.currentExecution
        ? {
            ...state.currentExecution,
            logs: [...state.currentExecution.logs, log],
          }
        : null,
    }))
  },

  clearLogs: () => {
    set((state) => ({
      currentExecution: state.currentExecution
        ? {
            ...state.currentExecution,
            logs: [],
          }
        : null,
    }))
  },

  updateSelectedNodeConfig: (patch: Record<string, unknown>) => {
    const { selectedNodeId } = get()
    if (!selectedNodeId) return
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...patch } } }
          : n,
      ),
      isDirty: true,
    }))
  },

  setSelectedNodeCredentialRef: (credential) => {
    const { selectedNodeId } = get()
    if (!selectedNodeId) return
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, credentials: credential || undefined } }
          : n,
      ),
      isDirty: true,
    }))
  },

  resendEmail: async (nodeId: string) => {
    const node = get().nodes.find((n) => n.id === nodeId)
    if (!node || node.data.type !== 'emailSend') return

    // Set loading status
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status: 'loading' } } : n,
      ),
    }))

    get().addExecutionLog({
      timestamp: new Date(),
      nodeId,
      level: 'info',
      message: `Resending email for node: ${node.data.label}`,
    })

    // Simulate
    await new Promise((r) => setTimeout(r, 800))

    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status: 'success' } } : n,
      ),
    }))

    get().addExecutionLog({
      timestamp: new Date(),
      nodeId,
      level: 'info',
      message: 'Email resent successfully',
    })
  },
}))

export { nodeTemplates }
