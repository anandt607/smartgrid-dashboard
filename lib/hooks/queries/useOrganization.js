/**
 * Hook to get current user's organization(s) with billing info
 */
import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/lib/api/user'
import { QUERY_KEYS } from '@/lib/utils/constants'

export function useOrganization() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: getUserProfile,
  })

  // Get primary organization (first active one)
  const primaryOrg = user?.organizations?.[0]

  return {
    // All organizations
    organizations: user?.organizations || [],
    
    // Primary organization
    organization: primaryOrg,
    organizationId: primaryOrg?.id,
    organizationName: primaryOrg?.name,
    organizationRole: primaryOrg?.role,
    
    // Billing info
    billing: primaryOrg?.billing,
    plan: primaryOrg?.billing?.plan,
    billingStatus: primaryOrg?.billing?.status,
    maxMembers: primaryOrg?.billing?.max_members,
    currentMembers: primaryOrg?.billing?.current_members,
    trialEndsAt: primaryOrg?.billing?.trial_ends_at,
    isOnTrial: primaryOrg?.billing?.status === 'trial',
    
    // App access
    apps: primaryOrg?.apps || [],
    hasTeamGridAccess: primaryOrg?.apps?.find(app => app.app_name === 'teamgrid')?.has_access,
    hasBrandGridAccess: primaryOrg?.apps?.find(app => app.app_name === 'brandgrid')?.has_access,
    hasCallGridAccess: primaryOrg?.apps?.find(app => app.app_name === 'callgrid')?.has_access,
    hasSalesGridAccess: primaryOrg?.apps?.find(app => app.app_name === 'salesgrid')?.has_access,
    
    // Permissions
    isOwner: primaryOrg?.role === 'owner',
    isAdmin: primaryOrg?.role === 'owner' || primaryOrg?.role === 'admin',
    canManageBilling: primaryOrg?.role === 'owner',
    canInviteMembers: primaryOrg?.role === 'owner' || primaryOrg?.role === 'admin',
    
    // Loading states
    isLoading,
    error,
  }
}

export default useOrganization

