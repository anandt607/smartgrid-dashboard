/**
 * GET /api/user/me
 * 
 * Get current user's complete data (Supabase + TeamGrid)
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// MongoDB connection
const MONGODB_URI = process.env.TEAMGRID_MONGODB_URI
let cachedClient = null

async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient
  }
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

// Get combined user data from MongoDB
async function getCombinedUserData(supabaseUser, teamgridMongoId) {
  try {
    const client = await connectToMongoDB()
    const db = client.db('test')
    
    const user = await db.collection('users').findOne({ _id: teamgridMongoId })
    if (!user) return { teamgrid: null, organization: null }

    const organization = user.organizationId 
      ? await db.collection('organizations').findOne({ _id: user.organizationId })
      : null

    return {
      teamgrid: {
        mongo_id: user._id,
        role: user.role,
        position: user.position,
        department: user.department,
        phone: user.phone,
        permissions: user.permissions,
        avatar: user.avatar,
        timezone: user.timezone,
        language: user.language,
        billingEnabled: user.billingEnabled
      },
      organization: organization ? {
        mongo_id: organization._id,
        name: organization.name,
        industry: organization.industry,
        size: organization.size
      } : null
    }
  } catch (error) {
    console.error('Error getting combined user data:', error)
    return { teamgrid: null, organization: null }
  }
}

// Update last login
async function updateTeamGridLastLogin(mongoUserId) {
  try {
    const client = await connectToMongoDB()
    const db = client.db('test')
    await db.collection('users').updateOne(
      { _id: mongoUserId },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    )
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

// Create Supabase admin client function
function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

// Create client for user session (using SSR package for proper cookie handling)
function createSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          // Cookie setting not needed for read-only operations
        },
        remove(name, options) {
          // Cookie removal not needed for read-only operations
        },
      },
    }
  )
}

// Helper function to get user data
async function getUserData(user) {
  try {
    // 1. Get user profile from Supabase
    const { data: profile } = await createSupabaseAdmin()
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // 2. Get organizations with billing and apps
    const { data: memberships } = await createSupabaseAdmin()
      .from('organization_members')
      .select(`
        *,
        organization:organizations(
          *,
          billing:organization_billing(*),
          apps:organization_apps(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
    
    // 3. Get TeamGrid data if profile exists
    let combinedData = { teamgrid: null, organization: null }
    if (profile?.teamgrid_mongo_id) {
      combinedData = await getCombinedUserData(user, profile.teamgrid_mongo_id)
      // Update last login in TeamGrid
      await updateTeamGridLastLogin(profile.teamgrid_mongo_id)
    }
    
    // 4. Return combined data
    return NextResponse.json({
      supabase_id: user.id,
      email: user.email,
      email_verified: !!user.email_confirmed_at,
      
      profile: {
        first_name: profile?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: profile?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        avatar_url: profile?.avatar_url || combinedData.teamgrid?.avatar || user.user_metadata?.avatar_url || '',
        platform_role: profile?.platform_role || 'user',
        timezone: profile?.timezone || combinedData.teamgrid?.timezone || 'UTC',
        language: profile?.language || combinedData.teamgrid?.language || 'en'
      },
      
      organizations: memberships?.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        role: m.role,
        mongo_id: m.organization.mongo_id,
        status: m.organization.status,
        
        // Billing info
        billing: m.organization.billing?.[0] ? {
          plan: m.organization.billing[0].plan,
          status: m.organization.billing[0].status,
          max_members: m.organization.billing[0].max_members,
          current_members: m.organization.billing[0].current_members,
          trial_ends_at: m.organization.billing[0].trial_ends_at,
          current_period_end: m.organization.billing[0].current_period_end,
          stripe_customer_id: m.organization.billing[0].stripe_customer_id,
          stripe_subscription_id: m.organization.billing[0].stripe_subscription_id
        } : null,
        
        // App access
        apps: m.organization.apps?.map(app => ({
          app_name: app.app_name,
          has_access: app.has_access,
          plan: app.plan,
          status: app.status,
          price_per_month: app.price_per_month
        })) || []
      })) || [],
      
      teamgrid: combinedData.teamgrid,
      organization: combinedData.organization,
      
      // Helper flags
      is_main_admin: profile?.platform_role === 'main_admin' || combinedData.teamgrid?.role === 'main_admin',
      has_organization: !!combinedData.organization || (memberships && memberships.length > 0),
      teamgrid_role: combinedData.teamgrid?.role
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

export async function GET(request) {
  try {
    // Get user from session cookies
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Don't log session missing errors - they're expected when user is not logged in
      if (authError?.name !== 'AuthSessionMissingError') {
        console.log('Auth error in /api/user/me:', authError)
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('User authenticated:', user.email)
    return await getUserData(user)
    
  } catch (error) {
    console.error('Error in /api/user/me:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

