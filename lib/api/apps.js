import { supabase } from '@/lib/supabase/client'

// Get all apps with user's access status
export const getApps = async (userId) => {
  // Fetch all apps
  const { data: apps, error: appsError } = await supabase
    .from('apps')
    .select('*')
    .order('name')
  
  if (appsError) {
    console.error('Error fetching apps:', appsError)
    // Return empty array if table doesn't exist or other error
    return []
  }
  
  // If no apps exist, return empty array
  if (!apps || apps.length === 0) {
    return []
  }
  
  // Fetch user's app access
  const { data: userAccess, error: accessError } = await supabase
    .from('app_access')
    .select('app_id, has_access')
    .eq('user_id', userId)
  
  if (accessError && accessError.code !== 'PGRST116') {
    console.error('Error fetching app access:', accessError)
  }
  
  // Create a map of user's app access
  const accessMap = (userAccess || []).reduce((acc, item) => {
    acc[item.app_id] = item.has_access
    return acc
  }, {})
  
  // Merge apps with access status
  return apps.map(app => ({
    ...app,
    hasAccess: accessMap[app.id] || false,
    isLocked: !accessMap[app.id] && app.requires_subscription,
  }))
}

// Get single app details
export const getApp = async (appId, userId) => {
  const { data: app, error: appError } = await supabase
    .from('apps')
    .select('*')
    .eq('id', appId)
    .single()
  
  if (appError) throw appError
  
  // Check user's access
  const { data: access, error: accessError } = await supabase
    .from('app_access')
    .select('has_access')
    .eq('app_id', appId)
    .eq('user_id', userId)
    .single()
  
  if (accessError && accessError.code !== 'PGRST116') {
    console.error('Error fetching app access:', accessError)
  }
  
  return {
    ...app,
    hasAccess: access?.has_access || false,
    isLocked: !access?.has_access && app.requires_subscription,
  }
}

// Grant app access to user
export const grantAppAccess = async (userId, appId) => {
  const { data, error } = await supabase
    .from('app_access')
    .upsert({
      user_id: userId,
      app_id: appId,
      has_access: true,
      granted_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Revoke app access from user
export const revokeAppAccess = async (userId, appId) => {
  const { data, error } = await supabase
    .from('app_access')
    .update({
      has_access: false,
      revoked_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('app_id', appId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Track app usage
export const trackAppUsage = async (userId, appId) => {
  const { data, error } = await supabase
    .from('app_usage')
    .insert({
      user_id: userId,
      app_id: appId,
      used_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error tracking app usage:', error)
  }
  return data
}
