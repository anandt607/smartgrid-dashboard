import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/lib/api/user'
import { QUERY_KEYS } from '@/lib/utils/constants'

/**
 * Hook to fetch current user data
 * Automatically refetches on window focus
 */
export const useUser = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    ...options,
  })
}

export default useUser
