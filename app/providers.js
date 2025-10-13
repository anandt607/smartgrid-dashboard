'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import ThemeProvider from '@/components/providers/ThemeProvider'

/**
 * Providers component to wrap the app with necessary providers
 * - TanStack Query for data fetching and caching
 * - ThemeProvider for Supabase-inspired theming
 */
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
