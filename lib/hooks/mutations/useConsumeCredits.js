import { useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { consumeCredits } from '@/lib/api/credits'
import { QUERY_KEYS } from '@/lib/utils/constants'

/**
 * Hook to consume credits for an action
 * @param {string} userId - User ID for cache invalidation
 */
export const useConsumeCredits = (userId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: consumeCredits,
    onSuccess: (data) => {
      // Invalidate billing query to refresh credit balance
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.BILLING(userId) 
      })

      // Show success message
      message.success(
        `Action completed! ${data.credits_consumed} credits used. ${data.credits_remaining} credits remaining.`
      )
    },
    onError: (error) => {
      const errorData = error?.response?.data

      if (error?.response?.status === 402) {
        // Insufficient credits
        message.error(
          `Insufficient credits! You need ${errorData.required} credits but only have ${errorData.available}.`
        )
      } else if (error?.response?.status === 403) {
        // Subscription not active
        message.error('Your subscription is not active. Please upgrade your plan.')
      } else {
        message.error(errorData?.error || 'Failed to complete action')
      }
    }
  })
}

export default useConsumeCredits

