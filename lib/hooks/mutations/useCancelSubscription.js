import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelSubscription } from '@/lib/api/billing'
import { QUERY_KEYS } from '@/lib/utils/constants'
import { message } from 'antd'

/**
 * Hook to cancel subscription
 * Uses optimistic update to immediately reflect the change
 */
export const useCancelSubscription = (userId) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: cancelSubscription,
    onMutate: async (subscriptionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.BILLING(userId) })
      
      // Snapshot the previous value
      const previousBilling = queryClient.getQueryData(QUERY_KEYS.BILLING(userId))
      
      // Optimistically update to the new value
      queryClient.setQueryData(QUERY_KEYS.BILLING(userId), (old) => ({
        ...old,
        status: 'cancelled',
      }))
      
      // Return context with the previous value
      return { previousBilling }
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousBilling) {
        queryClient.setQueryData(QUERY_KEYS.BILLING(userId), context.previousBilling)
      }
      message.error(error?.message || 'Failed to cancel subscription')
    },
    onSuccess: () => {
      message.success('Subscription cancelled successfully')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING(userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPS(userId) })
    },
  })
}

export default useCancelSubscription
