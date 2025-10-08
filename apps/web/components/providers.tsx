'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@buzz8n/ui/components/sonner'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { getQueryClient } from '@/utils/get-query-client'
import { ReactFlowProvider } from '@xyflow/react'
import * as React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ReactFlowProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools buttonPosition="bottom-right" />
        </QueryClientProvider>
      </ReactFlowProvider>
      <Toaster richColors />
    </NextThemesProvider>
  )
}
