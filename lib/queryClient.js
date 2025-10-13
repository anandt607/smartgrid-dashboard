import { QueryClient } from '@tanstack/react-query'
import { message } from 'antd'

// Create a client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Query error:', error)
        message.error(error?.message || 'An error occurred while fetching data')
      },
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error)
        message.error(error?.message || 'An error occurred while processing your request')
      },
    },
  },
})

export default queryClient
