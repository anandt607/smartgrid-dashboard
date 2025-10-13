import { useQuery } from '@tanstack/react-query'
import { getApps, getApp } from '@/lib/api/apps'
import { QUERY_KEYS } from '@/lib/utils/constants'

/**
 * Hook to fetch all apps with user's access status
 * @param {string} userId - User ID
 */
export const useApps = (userId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.APPS(userId),
    queryFn: () => getApps(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Hook to fetch a single app details
 * @param {string} appId - App ID
 * @param {string} userId - User ID
 */
export const useApp = (appId, userId, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.APP(appId, userId),
    queryFn: () => getApp(appId, userId),
    enabled: !!appId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export default useApps
