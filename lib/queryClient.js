import { QueryClient } from '@tanstack/react-query'
import { message } from 'antd'

// Create a client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Disable to prevent unnecessary auth calls
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry auth errors
        const isAuthError = error?.message?.includes('Not authenticated') ||
                           error?.message?.includes('Unauthorized') ||
                           error?.status === 401
        
        return !isAuthError && failureCount < 2 // Max 2 retries for non-auth errors
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.warn('Query error (handled):', error)
        // Don't show error messages for auth failures - let UI handle gracefully
        const isAuthError = error?.message?.includes('Not authenticated') ||
                           error?.message?.includes('Unauthorized') ||
                           error?.status === 401
        
        if (!isAuthError) {
          message.error(error?.message || 'An error occurred while fetching data')
        }
      },
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.warn('Mutation error (handled):', error)
        // Don't show error messages for auth failures
        const isAuthError = error?.message?.includes('Not authenticated') ||
                           error?.message?.includes('Unauthorized') ||
                           error?.status === 401
        
        if (!isAuthError) {
          message.error(error?.message || 'An error occurred while processing your request')
        }
      },
    },
  },
})

export default queryClient
