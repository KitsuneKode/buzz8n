import { create } from 'zustand'

export type TabType = 'workflows' | 'credentials' | 'executions' | 'settings'

export type Execution = {
  id: string
  workflowName: string
  status: 'success' | 'running' | 'failed' | 'queued'
  startedAt: string | Date
  runTimeMs: number
}

export type Credential = {
  id: string
  name: string
  provider: string
  createdAt: Date
  config: Record<string, string | boolean | number>
}

interface DashboardState {
  // Tab state
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  
  // Modal state
  isCredentialModalOpen: boolean
  setCredentialModalOpen: (open: boolean) => void
  
  // Credentials
  credentials: Credential[]
  addCredential: (credential: Omit<Credential, 'id' | 'createdAt'>) => void
  removeCredential: (id: string) => void
  
  // Executions
  executions: Execution[]
  addExecution: (execution: Omit<Execution, 'id'>) => void
  
  // Actions
  createWorkflow: () => void
  openCredentialModal: () => void
}

// Sample data
const sampleExecutions: Execution[] = [
  {
    id: 'exec_001',
    workflowName: 'Welcome Email Sequence',
    status: 'success',
    startedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    runTimeMs: 2340,
  },
  {
    id: 'exec_002',
    workflowName: 'Data Processing Pipeline',
    status: 'running',
    startedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    runTimeMs: 45000,
  },
  {
    id: 'exec_003',
    workflowName: 'Customer Onboarding',
    status: 'failed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    runTimeMs: 1200,
  },
]

const sampleCredentials: Credential[] = [
  {
    id: 'cred_001',
    name: 'Main Telegram Bot',
    provider: 'telegram',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    config: {
      botToken: '123456789:ABCdefGHIjklMNOpqrSTUvwxyz',
      chatId: '-1001234567890',
      sendTestMessage: true
    }
  },
  {
    id: 'cred_002',
    name: 'Support Slack Channel',
    provider: 'slack',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    config: {
      webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      channel: '#support'
    }
  },
  {
    id: 'cred_003',
    name: 'Gmail Notifications',
    provider: 'gmail',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    config: {
      email: 'notifications@company.com',
      appPassword: 'xxxx xxxx xxxx xxxx'
    }
  }
]

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  activeTab: 'workflows',
  isCredentialModalOpen: false,
  credentials: sampleCredentials,
  executions: sampleExecutions,
  
  // Tab actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Modal actions
  setCredentialModalOpen: (open) => set({ isCredentialModalOpen: open }),
  
  // Credential actions
  addCredential: (credentialData) => {
    const newCredential: Credential = {
      id: `cred_${Date.now()}`,
      createdAt: new Date(),
      ...credentialData
    }
    set((state) => ({
      credentials: [...state.credentials, newCredential]
    }))
  },
  
  removeCredential: (id) => {
    set((state) => ({
      credentials: state.credentials.filter(cred => cred.id !== id)
    }))
  },
  
  // Execution actions
  addExecution: (executionData) => {
    const newExecution: Execution = {
      id: `exec_${Date.now()}`,
      ...executionData
    }
    set((state) => ({
      executions: [newExecution, ...state.executions]
    }))
  },
  
  // Action handlers
  createWorkflow: () => {
    console.log('Creating workflow...')
    // Navigate to workflow editor
    if (typeof window !== 'undefined') {
      window.location.href = '/workflow/new'
    }
    // Add a new execution to simulate workflow creation
    const { addExecution } = get()
    addExecution({
      workflowName: 'New Workflow',
      status: 'queued',
      startedAt: new Date(),
      runTimeMs: 0
    })
  },
  
  openCredentialModal: () => {
    set({ isCredentialModalOpen: true })
  }
}))
