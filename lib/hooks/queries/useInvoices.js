import { useQuery } from '@tanstack/react-query'
import { getInvoices } from '@/lib/api/billing'
import { QUERY_KEYS } from '@/lib/utils/constants'

/**
 * Hook to fetch invoices for a user with pagination
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const useInvoices = (userId, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVOICES(userId, page),
    queryFn: () => getInvoices(userId, { page, limit }),
    enabled: !!userId,
    keepPreviousData: true, // Keep previous page data while fetching new page
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export default useInvoices
