import { useQuery } from '@tanstack/react-query'
import { getBillingInfo } from '@/lib/api/billing'
import { QUERY_KEYS } from '@/lib/utils/constants'

/**
 * Hook to fetch billing information for a user
 * @param {string} userId - User ID
 */
export const useBilling = (userId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.BILLING(userId),
    queryFn: () => getBillingInfo(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export default useBilling
