'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import ThemeProvider from '@/components/providers/ThemeProvider'
import AuthProvider from '@/components/providers/AuthProvider'

/**
 * Providers component to wrap the app with necessary providers
 * - TanStack Query for data fetching and caching
 * - AuthProvider for Supabase authentication state management
 * - ThemeProvider for Supabase-inspired theming
 */
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
