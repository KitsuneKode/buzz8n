'use client'

import { TabType, useDashboardStore } from '@/stores/dashboard'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Header } from './Header'

export function SmartHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeTab, setActiveTab, createWorkflow } = useDashboardStore()
  // Determine if we're in dashboard or marketing context
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/workflow')
  const isAuth = pathname.startsWith('/signin') || pathname.startsWith('/signup')

  const onTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab)
      router.replace(`/dashboard?tab=${tab}`)
    },
    [router, setActiveTab],
  )

  // Don't show header on auth pages
  if (isAuth) {
    return null
  }

  return (
    <Header
      variant={isDashboard ? 'dashboard' : 'marketing'}
      activeTab={isDashboard ? activeTab : undefined}
      onTabChange={isDashboard ? onTabChange : undefined}
      onCreateWorkflow={isDashboard ? createWorkflow : undefined}
    />
  )
}
