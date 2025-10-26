import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'

import {
  CredentialRef,
  EdgeData,
  Execution,
  ExecutionLog,
  ExecutionStatus,
  NodeData,
  NodeTemplate,
  WorkflowData,
} from '@/lib/types/workflow'
import { create } from 'zustand'

interface WorkflowEditorState {
  // Current workflow
  workflow: WorkflowData | null
  isDirty: boolean
  isFitView: boolean
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
  handleId: string | null

  // Execution state
  setCurrentExecution: (execution: Execution | null) => void
  currentExecution: Execution | null
  executionHistory: Execution[]

  // Actions
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
    handleId: string | null,
  ) => void
  deleteSelectedNodes: () => void
  selectNode: (nodeId: string | null) => void
  deleteNode: (nodeId: string) => void
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void
  updateSelectedNodeConfig: (patch: Record<string, unknown>) => void
  setSelectedNodeCredentialRef: (credential: CredentialRef | null) => void

  // UI actions
  toggleNodePalette: () => void
  toggleLogsDrawer: () => void
  togglePropertiesPanel: () => void
  openNodePaletteFor: (nodeId: string, handleId?: string) => void
  clearPendingConnect: () => void
  closeRightPanel: () => void

  // Workflow actions
  saveWorkflow: (updatedWorkflow: WorkflowData) => void

  // Execution actions
  addExecutionLog: (log: ExecutionLog) => void
  updateNodeStatus: (nodeId: string, status: string) => void
  clearLogs: () => void
  loadExecutionHistory: (executions: Execution[]) => void
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
  handleId: null,
  isNodePaletteOpen: true,
  isLogsDrawerOpen: false,
  isPropertiesPanelOpen: false,
  selectedNodeId: null,
  currentExecution: null,
  executionHistory: [],
  pendingConnectFromNodeId: null,
  isFitView: false,

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
    // Filter out selection-only changes to avoid setting isDirty on node selection

    const meaningfulChanges = changes.filter((change) => {
      if (change.type === 'select') {
        return false // Don't mark as dirty for selection changes
      }

      // Filter out position and dimension changes that don't affect workflow logic
      // These are typically triggered by React Flow's internal state management
      if (change.type === 'position' || change.type === 'dimensions') {
        return false
      }

      return true // Keep all other changes (add, remove, etc.)
    })

    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: meaningfulChanges.length > 0 ? true : state.isDirty,
    }))
  },

  onEdgesChange: (changes) => {
    // Filter out selection-only changes to avoid setting isDirty on edge selection
    const meaningfulChanges = changes.filter((change) => {
      if (change.type === 'select') {
        return false // Don't mark as dirty for selection changes
      }
      return true // Keep all other changes (add, remove, etc.)
    })

    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: meaningfulChanges.length > 0 ? true : state.isDirty,
    }))
  },

  onConnect: (connection) => {
    let type = 'deleteEdge'
    let nodes = get().nodes
    if (connection.sourceHandle && !connection.targetHandle) {
      const isAgent = connection.sourceHandle.split('-')[2] === 'agent'

      if (isAgent) {
        type = 'aiAgentTool'
        const parentId = connection.sourceHandle.split('-')[0]

        const node = nodes.find((n) => n.id === connection.target)
        if (node) {
          node.parentId = parentId
          nodes = [...nodes, node]
        }
      }
    }
    set((state) => ({
      edges: addEdge({ ...connection, type }, state.edges),
      nodes: [...nodes],
      isDirty: true,
    }))
  },

  addNodeWithEdge: (prevNodeId, template, position, handleId) => {
    const newNode: NodeData = {
      id: `node_${Date.now()}`,
      type: template.type,
      position,
      data: {
        ...template,
        config: { ...template.defaultConfig },
        status: 'initial',
      },
    }
    let newEdge: EdgeData | null = null

    if (!(template.type === 'webhook' || template.type === 'manualTrigger')) {
      newEdge = {
        id: `${prevNodeId}-${newNode.id}`,
        source: prevNodeId,
        target: newNode.id,
      }
    }

    if (template.type === 'webhook') {
      const uniquePath = crypto.randomUUID()
      newNode.data.config.path = uniquePath
    }

    if (handleId && handleId !== '' && newEdge) {
      if (template.category === 'ai-agent-tools') {
        newNode.parentId = prevNodeId
        newEdge.type = 'aiAgentTool'
      }

      newEdge.sourceHandle = handleId
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: newEdge ? [...state.edges, newEdge] : state.edges,
      isDirty: true,
      // isNodePaletteOpen: false,
      pendingConnectFromNodeId: null,
      // selectedNodeId: newNode.id,
    }))
  },
  addNode: (template, position) => {
    const newNode: NodeData = {
      id: `node_${Date.now()}`,
      type: template.type,
      position,
      data: {
        ...template,
        config: { ...template.defaultConfig },
        status: 'initial',
      },
    }
    if (template.type === 'webhook') {
      const uniquePath = crypto.randomUUID()
      newNode.data.config.path = uniquePath
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
      // When adding from the palette or toolbar, close the palette and open properties for the new node
      // isNodePaletteOpen: false,
      // selectedNodeId: newNode.id,
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

  openNodePaletteFor: (nodeId, handleId) => {
    if (handleId && handleId !== '') {
      set({
        isNodePaletteOpen: true,
        pendingConnectFromNodeId: nodeId,
        selectedNodeId: nodeId,
        handleId,
      })
    } else {
      set({
        isNodePaletteOpen: true,
        pendingConnectFromNodeId: nodeId,
        selectedNodeId: nodeId,
        handleId: null,
      })
    }
  },
  clearPendingConnect: () => set({ pendingConnectFromNodeId: null }),

  closeRightPanel: () =>
    set({
      isNodePaletteOpen: false,
      selectedNodeId: null,
      handleId: null,
      pendingConnectFromNodeId: null,
    }),

  // Workflow actions
  saveWorkflow: (updatedWorkflow) => {
    set({
      workflow: updatedWorkflow,
      isDirty: false,
    })
  },

  // Execution actions

  setCurrentExecution: (execution) => {
    set((state) => ({
      currentExecution: execution,
      executionHistory: execution ? [execution, ...state.executionHistory] : state.executionHistory,
    }))
  },

  addExecutionLog: (logData) => {
    set((state) => ({
      currentExecution: state.currentExecution
        ? {
            ...state.currentExecution,
            logs: [...state.currentExecution.logs, logData],
          }
        : null,
    }))
  },

  updateNodeStatus: (nodeId, status) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, status: status as ExecutionStatus } }
          : node,
      )

      // Check if status actually changed to avoid unnecessary re-renders
      const node = state.nodes.find((n) => n.id === nodeId)
      if (node?.data.status === status) {
        return state // No change, return current state
      }

      return { nodes: updatedNodes }
    })
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

  loadExecutionHistory: (executions) => {
    set((state) => ({
      executionHistory: [...state.executionHistory, ...executions],
    }))
  },
  updateNodeConfig: (id, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, config: { ...n.data.config, ...patch } } } : n,
      ),
      isDirty: true,
    }))
  },
  updateSelectedNodeConfig: (patch) => {
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
}))

export { nodeTemplates }
