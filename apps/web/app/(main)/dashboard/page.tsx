'use client'

import CredentialModal from '@/components/credentials/CredentialModal'
import { DashboardExecutions } from '@/components/DashboardExecutions'
import { WorkflowModal } from '@/components/workflow/WorkflowModal'
import { WorkflowCard } from '@/components/workflow/WorkflowCard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { WorkflowsInfiniteResponse } from '@buzz8n/common/types'
import { useInfiniteCredentials } from '@/hooks/useCredentials'
import { TabType, useDashboardStore } from '@/stores/dashboard'
import { useInfiniteWorkflowsList } from '@/hooks/useWorkflow'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useRouter, useSearchParams } from 'next/navigation'
import CredentialsList from '@/components/CredentialsList'
import { Spinner } from '@buzz8n/ui/components/spinner'
import { Button } from '@buzz8n/ui/components/button'
import HeaderNav from '@/components/HeaderNav'
import { isTabType } from '@/stores/dashboard'
import { ChevronUp } from 'lucide-react'

const DashboardPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { activeTab, setActiveTab, openCredentialModal } = useDashboardStore()

  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const { data: credentialsData, isLoading: credentialsLoading } = useInfiniteCredentials(10)
  const hasCredentials = credentialsData?.pages.some((page) => page.credentials.length > 0) ?? false
  // Use infinite query for workflows
  const {
    data: infiniteWorkflowsData,
    isLoading: workflowsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteWorkflowsList(10)

  // Flatten workflows data
  let totalCount: null | number = null
  const workflows =
    infiniteWorkflowsData?.pages.flatMap((page: WorkflowsInfiniteResponse) => {
      totalCount = page.totalCount
      return page.workflows.map((workflow) => ({
        ...workflow,
        createdAt: new Date(workflow.createdAt),
        updatedAt: new Date(workflow.updatedAt),
      }))
    }) || []

  // Use infinite scroll hook for workflows
  const { sentinelRef: workflowsSentinelRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  })

  const create = searchParams.get('create')
  const tab = searchParams.get('tab')

  const onTabChange = useCallback(
    (tab: TabType) => {
      router.replace(`/dashboard?tab=${tab}`)
      setActiveTab(tab)
    },
    [router, setActiveTab],
  )

  const notTop = useMemo(() => scrollY > 100, [scrollY])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (tab && isTabType(tab as string)) {
      onTabChange(tab as TabType)
    }
    if (create && create !== undefined && create === 'true') {
      setShowWorkflowModal(true)
    }
  }, [tab, create, router, onTabChange])

  const onCreateWorkflow = () => {
    setShowWorkflowModal(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workflows':
        return (
          <div className="space-y-6">
            {/* Create New Workflow Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div
                className="bg-card border border-border rounded-lg p-6 hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onClick={onCreateWorkflow}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Start from scratch
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Build a custom workflow from the ground up
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-secondary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Test a simple AI Agent example
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Try out a pre-built AI workflow template
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Workflows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Workflows</h2>

                <>
                  {workflowsLoading ? (
                    <Spinner />
                  ) : (
                    totalCount &&
                    totalCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {totalCount} workflow{totalCount !== 1 && 's'}
                      </span>
                    )
                  )}
                </>
              </div>

              {workflowsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-lg p-6 animate-pulse"
                    >
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : workflows && workflows.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflows.map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                  </div>

                  {/* Infinite scroll sentinel for workflows */}
                  <div ref={workflowsSentinelRef} className="py-4">
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center">
                        <Spinner className="mr-2" />
                        <span className="text-sm text-muted-foreground">
                          Loading more workflows...
                        </span>
                      </div>
                    )}
                    {!hasNextPage && workflows.length > 0 && (
                      <div className="text-center text-sm text-muted-foreground">
                        No more workflows to load
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No workflows yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first workflow to get started with automation
                  </p>
                  <Button onClick={onCreateWorkflow}>Create Your First Workflow</Button>
                </div>
              )}
            </div>
          </div>
        )
      case 'credentials':
        return (
          <div className="flex flex-col items-center justify-center min-h-96">
            {credentialsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="size-5" />
                <span>Loading credentials…</span>
              </div>
            ) : !hasCredentials ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">👋</div>
                <h2 className="text-xl font-semibold text-foreground">
                  Let&apos;s set up a credential
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Connect your accounts and services to enable powerful integrations in your
                  workflows.
                </p>
                <Button
                  onClick={openCredentialModal}
                  className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Add first credential
                </Button>
              </div>
            ) : (
              <CredentialsList />
            )}
          </div>
        )
      case 'executions':
        return <DashboardExecutions />
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto pt-18">
      <HeaderNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateWorkflow={onCreateWorkflow}
      />
      <div className="px-6 py-6">
        <div className="mt-8">{renderTabContent()}</div>
      </div>

      {notTop && (
        <Button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="fixed bottom-16 right-8 z-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground/90 p-2 rounded-full border border-border shadow-md"
        >
          <ChevronUp className="size-6" />
        </Button>
      )}
      <CredentialModal />
      <WorkflowModal open={showWorkflowModal} onOpenChange={setShowWorkflowModal} />
    </div>
  )
}

export default DashboardPage
