'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@buzz8n/ui/components/sonner'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getQueryClient } from '@/utils/get-query-client'
import { Analytics } from '@vercel/analytics/next'
import { ReactFlowProvider } from '@xyflow/react'
import NextTopLoader from 'nextjs-toploader'
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
      <NextTopLoader crawl color="oklch(0.6716 0.1368 48.513)" />

      <ReactFlowProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools buttonPosition="bottom-right" />
        </QueryClientProvider>
      </ReactFlowProvider>
      <Analytics />
      <SpeedInsights />
      <Toaster richColors />
    </NextThemesProvider>
  )
}
