import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile } from '@/lib/api/user'
import { QUERY_KEYS } from '@/lib/utils/constants'
import { message } from 'antd'

/**
 * Hook to update user profile
 * Automatically invalidates user query on success
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      message.success('Profile updated successfully!')
      return data
    },
    onError: (error) => {
      message.error(error?.message || 'Failed to update profile')
      throw error
    },
  })
}

export default useUpdateProfile
