import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCheckoutSession } from '@/lib/api/billing'
import { QUERY_KEYS } from '@/lib/utils/constants'
import { message } from 'antd'

/**
 * Hook to upgrade plan
 * Creates a Stripe checkout session and redirects user
 */
export const useUpgradePlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        message.success('Subscription updated successfully!')
        // Invalidate billing and apps queries
        queryClient.invalidateQueries({ queryKey: ['billing'] })
        queryClient.invalidateQueries({ queryKey: ['apps'] })
      }
      return data
    },
    onError: (error) => {
      message.error(error?.message || 'Failed to upgrade plan')
      throw error
    },
  })
}

export default useUpgradePlan
