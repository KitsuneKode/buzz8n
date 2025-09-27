'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@buzz8n/ui/components/dropdown-menu'
import {
  Menu,
  X,
  Brain,
  Zap,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Dog,
} from 'lucide-react'
import { Button } from '@buzz8n/ui/components/button'
import { Badge } from '@buzz8n/ui/components/badge'
import type { TabType } from '@/stores/dashboard'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  variant?: 'marketing' | 'dashboard'
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onSignOut?: () => void
  className?: string
  // Dashboard-specific props
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
  onCreateWorkflow?: () => void
}

interface NavItem {
  id: string
  label: string
  href: string
  badge?: string
}

export function Header({
  variant = 'marketing',
  user,
  onSignOut,
  className = '',
  activeTab,
  onTabChange,
  onCreateWorkflow,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const marketingNavItems: NavItem[] = [
    { id: 'features', label: 'AI Features', href: '#features' },
    { id: 'demo', label: 'Demo', href: '#demo' },
    { id: 'showcase', label: 'Intelligence', href: '#showcase' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'faqs', label: 'FAQs', href: '/faqs' },
  ]

  const dashboardNavItems: NavItem[] = [
    { id: 'workflows', label: 'Workflows', href: '/dashboard' },
    { id: 'credentials', label: 'Credentials', href: '/dashboard' },
    { id: 'executions', label: 'Executions', href: '/dashboard' },
    { id: 'settings', label: 'Settings', href: '/dashboard' },
  ]

  const navItems = variant === 'marketing' ? marketingNavItems : dashboardNavItems

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMobileMenuOpen(false)
  }

  const isActiveLink = (item: NavItem) => {
    if (variant === 'marketing') {
      return false // Marketing uses scroll-based active states
    }
    // For dashboard, use activeTab if provided, otherwise fall back to pathname
    if (activeTab) {
      return activeTab === item.id
    }
    return pathname === item.href
  }

  const handleNavClick = (item: NavItem) => {
    if (variant === 'marketing') {
      scrollToSection(item.href)
    } else {
      // Dashboard navigation
      if (onTabChange) {
        onTabChange(item.id as TabType)
      } else {
        // Fallback to regular navigation if no tab handler
        window.location.href = item.href
      }
    }
  }

  // Calculate dynamic island effect
  const scrollProgress = Math.min(scrollY / 200, 1)
  const isCompact = scrollY > 100

  return (
    <motion.header
      initial={{ y: pathname === '/' ? -100 : 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed z-50 transition-all duration-500 ease-out ${className}`}
      style={{
        top: isCompact ? '12px' : '0px',
        left: isCompact ? '50%' : '0px',
        right: isCompact ? 'auto' : '0px',
        transform: isCompact ? 'translateX(-50%)' : 'none',
        width: isCompact ? 'auto' : '100%',
        maxWidth: isCompact ? '600px' : 'none',
      }}
    >
      <div
        className={`transition-all duration-500 ease-out ${
          isCompact
            ? 'bg-background/95 backdrop-blur-xl border border-border/50 rounded-full px-6 py-2 shadow-lg shadow-black/10'
            : isScrolled || variant === 'dashboard'
              ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm px-4'
              : 'bg-transparent px-4'
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 ${
            isCompact ? 'h-12 space-x-4' : 'h-16'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Dog className="h-8 w-8 text-primary transition-transform duration-200 group-hover:scale-110" />
              <Zap className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold text-foreground">Buzz8n</span>
            {variant === 'marketing' && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 text-xs ml-2"
              >
                <Sparkles className="w-2 h-2 mr-1" />
                AI
              </Badge>
            )}
          </Link>

          {/* Desktop Navigation - Hidden when compact */}
          {!isCompact && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                      isActiveLink(item)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isActiveLink(item) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                  </button>
                </motion.div>
              ))}
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {variant === 'marketing' ? (
              <>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Dog className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{user.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      handleNavClick(item)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActiveLink(item)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
                  </button>
                </div>
              ))}

              <div className="pt-4 space-y-2 border-t border-border">
                {variant === 'marketing' ? (
                  <>
                    <Link href="/signin" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button size="sm" className="w-full">
                        <Dog className="w-4 h-4 mr-2" />
                        Start Building
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    {user && (
                      <div className="pt-2">
                        <div className="px-3 py-2 text-sm">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={onSignOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
