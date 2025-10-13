import apiClient from './client'
import { supabase } from '@/lib/supabase/client'

// Get current user profile
export const getUserProfile = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  
  // Just return auth user data - no separate users table needed
  return {
    ...user,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    profile: user.user_metadata || {},
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
