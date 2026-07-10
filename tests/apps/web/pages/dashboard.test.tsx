import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mutable controls for mocks
let sp: { create: string | null; tab: string | null } = { create: null, tab: null }
let workflowsData: any[] = []
let workflowsLoading = false
let storeState: {
  activeTab: 'workflows' | 'credentials' | 'executions' | 'settings'
  credentials: any[]
  executions: any[]
} = { activeTab: 'workflows', credentials: [], executions: [] }

// Mocks
mock.module('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'create' ? sp.create : key === 'tab' ? sp.tab : null),
  }),
  useRouter: () => ({
    replace: mock(() => {}),
  }),
}))

mock.module('@/hooks/useWorkflow', () => ({
  useInfiniteWorkflowsList: () => ({
    data: {
      pages: [
        {
          workflows: workflowsData,
          totalCount: workflowsData.length,
        },
      ],
    },
    isLoading: workflowsLoading,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: mock(() => {}),
  }),
}))

mock.module('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: () => ({
    sentinelRef: mock(() => {}),
  }),
}))

mock.module('@/stores/dashboard', () => ({
  useDashboardStore: () => ({
    activeTab: storeState.activeTab,
    setActiveTab: (t: any) => {
      storeState.activeTab = t
    },
    credentials: storeState.credentials,
    executions: storeState.executions,
    openCredentialModal: () => {},
  }),
  isTabType: (v: string) => ['workflows', 'credentials', 'executions', 'settings'].includes(v),
}))

mock.module('@/components/HeaderNav', () => ({
  default: ({ onTabChange }: any) => (
    <nav>
      <button onClick={() => onTabChange('workflows')}>Workflows</button>
      <button onClick={() => onTabChange('credentials')}>Credentials</button>
      <button onClick={() => onTabChange('executions')}>Executions</button>
      <button onClick={() => onTabChange('settings')}>Settings</button>
    </nav>
  ),
}))

mock.module('@/components/workflow/WorkflowCard', () => ({
  WorkflowCard: ({ workflow }: any) => <div>WorkflowCard:{workflow?.id}</div>,
}))

mock.module('@/components/DashboardExecutions', () => ({
  DashboardExecutions: ({ executions }: any) => <div>Executions:{executions?.length ?? 0}</div>,
}))

mock.module('@/components/CredentialsList', () => ({
  default: ({ credentials }: any) => <div>Credentials:{credentials?.length ?? 0}</div>,
}))

mock.module('@/components/workflow/WorkflowModal', () => ({
  WorkflowModal: ({ open }: any) => (open ? <div>WorkflowModal:open</div> : null),
}))

mock.module('@/components/credentials/CredentialModal', () => ({
  default: () => null,
}))

// Import after mocks
const DashboardPage = (await import('@buzz8n/web/app/(main)/dashboard/page')).default

describe('Dashboard Page Flow', () => {
  beforeEach(() => {
    sp = { create: null, tab: null }
    workflowsData = []
    workflowsLoading = false
    storeState = { activeTab: 'workflows', credentials: [], executions: [] }
  })

  test('renders empty workflows state and CTA', () => {
    render(<DashboardPage />)
    expect(screen.getByText('No workflows yet')).toBeTruthy()
    expect(screen.getByText('Create Your First Workflow')).toBeTruthy()
  })

  test('renders workflows list when data is present', () => {
    workflowsData = [{ id: 'w1' }, { id: 'w2' }]
    render(<DashboardPage />)

    expect(screen.getByText('Your Workflows')).toBeTruthy()
    expect(screen.getByText('WorkflowCard:w1')).toBeTruthy()
    expect(screen.getByText('WorkflowCard:w2')).toBeTruthy()
  })

  test('shows credentials empty state when credentials tab active', () => {
    storeState.activeTab = 'credentials'
    render(<DashboardPage />)
    expect(screen.getByText("Let's set up a credential")).toBeTruthy()
    expect(screen.getByText('Add first credential')).toBeTruthy()
  })

  test('opens workflow modal when create=true in search params', () => {
    sp.create = 'true'
    render(<DashboardPage />)
    expect(screen.getByText('WorkflowModal:open')).toBeTruthy()
  })
})
