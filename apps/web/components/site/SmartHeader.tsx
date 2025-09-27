'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { useDashboardStore } from '@/stores/dashboard'

// Mock user data - in a real app, this would come from authentication context
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: undefined // Will show default user icon
}

export function SmartHeader() {
  const pathname = usePathname()
  const { activeTab, setActiveTab, createWorkflow } = useDashboardStore()
  
  // Determine if we're in dashboard or marketing context
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/workflow')
  const isAuth = pathname.startsWith('/auth')
  
  // Don't show header on auth pages
  if (isAuth) {
    return null
  }
  
  const handleSignOut = () => {
    // Handle sign out logic here
    console.log('Sign out clicked')
    // In a real app, this would clear auth tokens and redirect
  }

  return (
    <Header 
      variant={isDashboard ? 'dashboard' : 'marketing'}
      user={isDashboard ? mockUser : undefined}
      onSignOut={handleSignOut}
      activeTab={isDashboard ? activeTab : undefined}
      onTabChange={isDashboard ? setActiveTab : undefined}
      onCreateWorkflow={isDashboard ? createWorkflow : undefined}
    />
  )
}
