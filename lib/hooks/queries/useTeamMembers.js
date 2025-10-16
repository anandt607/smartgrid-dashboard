/**
 * Hook for team member management operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * Get organization members
 * @param {string} organizationId - Organization ID
 */
export function useTeamMembers(organizationId) {
  return useQuery({
    queryKey: ['team-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return { members: [], total: 0 }

      const response = await fetch(`/api/organization/members/list?organizationId=${organizationId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch team members')
      }

      return response.json()
    },
    enabled: !!organizationId,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Invite team member mutation
 */
export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberData) => {
      const response = await fetch('/api/organization/members/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to invite member')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate team members query for the organization
      queryClient.invalidateQueries(['team-members', variables.organizationId])
      
      // Also invalidate user data to update member count
      queryClient.invalidateQueries(['user'])
    }
  })
}

/**
 * Remove team member mutation
 */
export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, organizationId }) => {
      const response = await fetch('/api/organization/members/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, organizationId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate team members query for the organization
      queryClient.invalidateQueries(['team-members', variables.organizationId])
      
      // Also invalidate user data to update member count
      queryClient.invalidateQueries(['user'])
    }
  })
}

export default useTeamMembers
