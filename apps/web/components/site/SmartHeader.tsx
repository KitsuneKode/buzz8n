'use client'

import { useDashboardStore } from '@/stores/dashboard'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export function SmartHeader() {
  const pathname = usePathname()
  const { activeTab, setActiveTab, createWorkflow } = useDashboardStore()
  // Determine if we're in dashboard or marketing context
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/workflow')
  const isAuth = pathname.startsWith('/signin') || pathname.startsWith('/signup')

  // Don't show header on auth pages
  if (isAuth) {
    return null
  }

  return (
    <Header
      variant={isDashboard ? 'dashboard' : 'marketing'}
      activeTab={isDashboard ? activeTab : undefined}
      onTabChange={isDashboard ? setActiveTab : undefined}
      onCreateWorkflow={isDashboard ? createWorkflow : undefined}
    />
  )
}
