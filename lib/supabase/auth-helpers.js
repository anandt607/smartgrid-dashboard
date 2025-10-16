/**
 * Supabase Auth Helpers for SmartGrid Dashboard
 * 
 * These functions handle authentication and user data fetching
 * linking Supabase auth with MongoDB user data
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Get current authenticated user from Supabase
 */
export async function getCurrentSupabaseUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting Supabase user:', error)
    return null
  }
  
  return user
}

/**
 * Get full user data (Supabase + user profile + organizations)
 */
export async function getFullUserData() {
  try {
    // 1. Get Supabase auth user
    const supabaseUser = await getCurrentSupabaseUser()
    if (!supabaseUser) return null
    
    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error getting user profile:', profileError)
    }
    
    // 3. Get user's organizations
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', supabaseUser.id)
      .eq('is_active', true)
    
    if (memberError) {
      console.error('Error getting organizations:', memberError)
    }
    
    // Return combined data
    return {
      supabase_id: supabaseUser.id,
      email: supabaseUser.email,
      email_confirmed: !!supabaseUser.email_confirmed_at,
      profile: profile || {
        first_name: supabaseUser.user_metadata?.first_name || '',
        last_name: supabaseUser.user_metadata?.last_name || '',
        platform_role: 'user'
      },
      organizations: memberships?.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
        mongo_id: m.organization.mongo_id
      })) || [],
      teamgrid_mongo_id: profile?.teamgrid_mongo_id || supabaseUser.user_metadata?.mongo_id
    }
  } catch (error) {
    console.error('Error getting full user data:', error)
    return null
  }
}

/**
 * Get user's accessible apps for a specific organization
 */
export async function getUserAccessibleApps(organizationId) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_accessible_apps', {
        user_uuid: (await getCurrentSupabaseUser())?.id,
        org_uuid: organizationId
      })
    
    if (error) {
      console.error('Error getting accessible apps:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting accessible apps:', error)
    return []
  }
}

/**
 * Check if user has access to a specific app in an organization
 */
export async function userHasAppAccess(organizationId, appName) {
  try {
    const supabaseUser = await getCurrentSupabaseUser()
    if (!supabaseUser) return false
    
    const { data, error } = await supabase
      .rpc('user_has_app_access', {
        user_uuid: supabaseUser.id,
        org_uuid: organizationId,
        app: appName
      })
    
    if (error) {
      console.error('Error checking app access:', error)
      return false
    }
    
    return data === true
  } catch (error) {
    console.error('Error checking app access:', error)
    return false
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    // Get full user data after login
    const userData = await getFullUserData()
    
    return {
      success: true,
      user: userData,
      session: data.session
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sign up new user
 */
export async function signUpUser(email, password, firstName, lastName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Check if user is main admin (platform admin)
 */
export async function isMainAdmin() {
  try {
    const userData = await getFullUserData()
    return userData?.profile?.platform_role === 'main_admin'
  } catch (error) {
    return false
  }
}

/**
 * Get organization details
 */
export async function getOrganization(organizationId) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()
    
    if (error) {
      console.error('Error getting organization:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error getting organization:', error)
    return null
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId) {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        user:user_profiles(*)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Error getting organization members:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting organization members:', error)
    return []
  }
}

