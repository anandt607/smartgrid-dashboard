import apiClient from './client'
import { supabase } from '@/lib/supabase/client'

// Get current user profile (with TeamGrid data)
export const getUserProfile = async () => {
  // First check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.warn('User not authenticated in getUserProfile')
    // Throw error with 401 status so React Query can handle it properly
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }
  
  // Fetch full user data from API (includes TeamGrid MongoDB data)
  try {
    console.log('📡 Making /api/user/me request with session')
    const response = await fetch('/api/user/me', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      // If 401, throw error to trigger redirect
      if (response.status === 401) {
        console.warn('API returned 401, user not authenticated')
        const error = new Error('Unauthorized')
        error.status = 401
        throw error
      }
      
      // For other errors, fall back to basic Supabase data
      console.warn('Failed to fetch full user data, using basic auth data', response.status)
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        profile: user.user_metadata || {},
        organizations: [], // Empty array so UI doesn't break
        has_organization: false,
      }
    }
    
    const userData = await response.json()
    
    // Return combined data in expected format
    return {
      id: userData.supabase_id,
      email: userData.email,
      full_name: `${userData.profile.first_name} ${userData.profile.last_name}`.trim(),
      first_name: userData.profile.first_name,
      last_name: userData.profile.last_name,
      avatar_url: userData.profile.avatar_url,
      profile: userData.profile,
      organizations: userData.organizations,
      teamgrid: userData.teamgrid,
      organization: userData.organization,
      is_main_admin: userData.is_main_admin,
      teamgrid_role: userData.teamgrid_role,
      has_organization: userData.has_organization,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    // Fall back to basic data
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      profile: user.user_metadata || {},
      organizations: [], // Empty array so UI doesn't break
      has_organization: false,
    }
  }
}

// Update user profile
export const updateUserProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Update auth user metadata
  const { data, error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      phone: updates.phone,
      company: updates.company,
    },
  })
  
  if (authError) throw authError
  
  return {
    id: user.id,
    email: user.email,
    full_name: updates.full_name,
    avatar_url: updates.avatar_url,
    phone: updates.phone,
    company: updates.company,
  }
}

// Upload user avatar
export const uploadAvatar = async (file) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)
  
  if (uploadError) throw uploadError
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// Delete user account
export const deleteUserAccount = async () => {
  const { data, error } = await apiClient.delete('/api/user/delete')
  if (error) throw error
  return data
}
