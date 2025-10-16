import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/lib/api/user'
import { QUERY_KEYS } from '@/lib/utils/constants'
import { supabase } from '@/lib/supabase/client'

/**
 * Hook to fetch current user data
 * Automatically refetches on window focus
 * Only fetches when user is authenticated
 */
export const useUser = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: async () => {
      // Check if we're on auth pages - don't fetch user data
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.includes('/login') || 
                          window.location.pathname.includes('/signup')
        if (isAuthPage) {
          console.log('🚫 Skipping user fetch on auth page')
          return null
        }
      }

      // Check authentication first
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        console.log('🚫 No session, skipping user fetch')
        // Throw 401 error so it can be handled properly
        const authError = new Error('Unauthorized')
        authError.status = 401
        throw authError
      }
      
      // Fetch user profile (this will throw 401 if not authenticated)
      return await getUserProfile()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Disable to prevent unnecessary calls
    retry: false, // Don't retry on auth failures
    enabled: typeof window !== 'undefined' ? 
      !window.location.pathname.includes('/login') && 
      !window.location.pathname.includes('/signup') : true,
    ...options,
  })
}

export default useUser
