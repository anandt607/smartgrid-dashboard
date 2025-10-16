/**
 * GET /api/organization/members/list?organizationId=xxx
 * 
 * Get all members of an organization
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Create Supabase admin client function
function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

// Create client for user session
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
        set(name, value, options) {},
        remove(name, options) {},
      },
    }
  )
}

export async function GET(request) {
  try {
    const origin = request.headers.get('origin')
    
    // Check for Grid Apps API secret (for cross-origin calls from TeamGrid, etc.)
    const authHeader = request.headers.get('authorization')
    const gridAppsSecret = process.env.GRID_APPS_API_SECRET
    
    let isAuthenticated = false
    let user = null

    // Option 1: Check for Grid Apps API secret
    if (authHeader && authHeader.startsWith('Bearer ') && gridAppsSecret) {
      const token = authHeader.replace('Bearer ', '')
      if (token === gridAppsSecret) {
        console.log('✅ Authenticated via Grid Apps API secret')
        isAuthenticated = true
        // For cross-origin calls, we won't have a specific user
        // The organizationId will be validated separately
      }
    }

    // Option 2: Check session (for SmartGrid Dashboard calls)
    if (!isAuthenticated) {
      const supabase = createSupabaseClient()
      const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && sessionUser) {
        console.log('✅ Authenticated via session:', sessionUser.email)
        isAuthenticated = true
        user = sessionUser
      }
    }

    // If neither auth method worked, return 401
    if (!isAuthenticated) {
      console.log('❌ Authentication failed - no valid session or API secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get organizationId from query params
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    console.log(`📋 Getting members for organization ${organizationId}`)

    // 1. Check if current user is member of this organization (skip for API secret auth)
    let userMembership = null
    if (user) {
      const { data: membership } = await createSupabaseAdmin()
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'You are not a member of this organization' },
          { status: 403 }
        )
      }
      userMembership = membership
    }

    // 2. Get all organization members
    const { data: members, error: membersError } = await createSupabaseAdmin()
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('❌ Error fetching members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch organization members' },
        { status: 500 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        members: [],
        total: 0,
        current_user_role: userMembership?.role || null
      })
    }

    // 3. Get user profiles for all members
    const userIds = members.map(m => m.user_id)
    const { data: profiles } = await createSupabaseAdmin()
      .from('user_profiles')
      .select('user_id, first_name, last_name, avatar_url, platform_role')
      .in('user_id', userIds)

    // Create a map of profiles
    const profileMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.user_id] = profile
      return acc
    }, {})

    // 4. Get member app access for all members
    const { data: memberAppAccess } = await createSupabaseAdmin()
      .from('member_app_access')
      .select('user_id, app_name, has_access')
      .eq('organization_id', organizationId)

    // Create a map of member app access
    const appAccessMap = (memberAppAccess || []).reduce((acc, access) => {
      if (!acc[access.user_id]) {
        acc[access.user_id] = {}
      }
      acc[access.user_id][access.app_name] = access.has_access
      return acc
    }, {})

    // 5. Get auth data for each member to get email
    const membersWithAuth = await Promise.all(
      members.map(async (member) => {
        try {
          const { data: authUser } = await createSupabaseAdmin().auth.admin.getUserById(member.user_id)
          const profile = profileMap[member.user_id]
          
          return {
            id: member.user_id,
            email: authUser?.user?.email || 'Unknown',
            first_name: profile?.first_name || 'Unknown',
            last_name: profile?.last_name || 'User',
            avatar_url: profile?.avatar_url || null,
            role: member.role,
            platform_role: profile?.platform_role || 'user',
            joined_at: member.created_at,
            is_current_user: user ? member.user_id === user.id : false,
            last_seen: authUser?.user?.last_sign_in_at || null,
            app_access: appAccessMap[member.user_id] || {}
          }
        } catch (error) {
          console.error(`⚠️ Error getting auth data for user ${member.user_id}:`, error)
          const profile = profileMap[member.user_id]
          return {
            id: member.user_id,
            email: 'Error loading',
            first_name: profile?.first_name || 'Unknown',
            last_name: profile?.last_name || 'User',
            avatar_url: profile?.avatar_url || null,
            role: member.role,
            platform_role: profile?.platform_role || 'user',
            joined_at: member.created_at,
            is_current_user: user ? member.user_id === user.id : false,
            last_seen: null,
            app_access: appAccessMap[member.user_id] || {}
          }
        }
      })
    )

    console.log(`✅ Found ${membersWithAuth.length} members`)

    return NextResponse.json({
      success: true,
      members: membersWithAuth,
      total: membersWithAuth.length,
      current_user_role: userMembership?.role || null
    })

  } catch (error) {
    console.error('Error fetching organization members:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
