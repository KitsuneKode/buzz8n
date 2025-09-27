import { create } from 'zustand'
import { NodeData, EdgeData, WorkflowData, Execution, ExecutionLog, NodeTemplate, NodeType } from '@/lib/types/workflow'
import { addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection } from '@xyflow/react'

interface WorkflowEditorState {
  // Current workflow
  workflow: WorkflowData | null
  isDirty: boolean
  
  // Canvas state
  nodes: NodeData[]
  edges: EdgeData[]
  selectedNodes: string[]
  selectedEdges: string[]
  
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
  setWorkflow: (workflow: WorkflowData) => void
  setActiveTab: (tab: 'editor' | 'executions' | 'evaluations') => void
  
  // Canvas actions
  onNodesChange: (changes: NodeChange<NodeData>[]) => void
  onEdgesChange: (changes: EdgeChange<EdgeData>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (template: NodeTemplate, position: { x: number; y: number }) => void
  deleteSelectedNodes: () => void
  selectNode: (nodeId: string | null) => void
  
  // UI actions
  toggleNodePalette: () => void
  toggleLogsDrawer: () => void
  togglePropertiesPanel: () => void
  
  // Workflow actions
  saveWorkflow: () => void
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
    id: 'telegram-get-chat',
    type: 'telegramGetChat',
    label: 'Get a chat',
    description: 'Get chat information from Telegram',
    icon: '💬',
    category: 'app-event',
    defaultConfig: {
      chatId: '',
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
  
  // Workflow actions
  setWorkflow: (workflow) => set({ 
    workflow, 
    nodes: workflow.nodes, 
    edges: workflow.edges,
    isDirty: false 
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
  
  addNode: (template, position) => {
    const newNode: NodeData = {
      id: `node_${Date.now()}`,
      type: template.type,
      position,
      data: {
        label: template.label,
        type: template.type,
        config: { ...template.defaultConfig },
        status: 'idle',
      },
    }
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
    }))
  },
  
  deleteSelectedNodes: () => {
    const { selectedNodes } = get()
    if (selectedNodes.length === 0) return
    
    set((state) => ({
      nodes: state.nodes.filter(node => !selectedNodes.includes(node.id)),
      edges: state.edges.filter(edge => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      ),
      selectedNodes: [],
      isDirty: true,
    }))
  },
  
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  // UI actions
  toggleNodePalette: () => set((state) => ({ 
    isNodePaletteOpen: !state.isNodePaletteOpen 
  })),
  
  toggleLogsDrawer: () => set((state) => ({ 
    isLogsDrawerOpen: !state.isLogsDrawerOpen 
  })),
  
  togglePropertiesPanel: () => set((state) => ({ 
    isPropertiesPanelOpen: !state.isPropertiesPanelOpen 
  })),
  
  // Workflow actions
  saveWorkflow: () => {
    const { workflow, nodes, edges } = get()
    if (!workflow) return
    
    const updatedWorkflow: WorkflowData = {
      ...workflow,
      nodes,
      edges,
      updatedAt: new Date(),
    }
    
    // Here you would typically save to a backend
    console.log('Saving workflow:', updatedWorkflow)
    
    set({ 
      workflow: updatedWorkflow, 
      isDirty: false 
    })
  },
  
  executeWorkflow: async () => {
    const { nodes, workflow } = get()
    if (!workflow || nodes.length === 0) return
    
    const execution: Execution = {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: 'running',
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
        nodes: state.nodes.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, status: 'running' } }
            : n
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update node status to success
      set((state) => ({
        nodes: state.nodes.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, status: 'success' } }
            : n
        ),
      }))
    }
    
    // Complete execution
    const finishedAt = new Date()
    const durationMs = finishedAt.getTime() - execution.startedAt.getTime()
    
    set((state) => ({
      isExecuting: false,
      currentExecution: state.currentExecution ? {
        ...state.currentExecution,
        status: 'success',
        finishedAt,
        durationMs,
        summary: `Workflow completed successfully in ${durationMs}ms`,
      } : null,
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
      currentExecution: state.currentExecution ? {
        ...state.currentExecution,
        logs: [...state.currentExecution.logs, log],
      } : null,
    }))
  },
  
  clearLogs: () => {
    set((state) => ({
      currentExecution: state.currentExecution ? {
        ...state.currentExecution,
        logs: [],
      } : null,
    }))
  },
}))

export { nodeTemplates }
