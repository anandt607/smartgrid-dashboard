import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/utils/constants'

/**
 * Hook to fetch all available plans from database
 * Plans are dynamically synced from Stripe
 */
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await fetch('/api/plans')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch plans')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to get a specific plan by stripe price ID
 */
export function usePlan(stripePriceId) {
  const { data: plans, ...rest } = usePlans()
  
  const plan = plans?.find(p => p.id === stripePriceId) || null
  
  return {
    data: plan,
    ...rest
  }
}
