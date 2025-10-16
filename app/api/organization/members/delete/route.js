/**
 * DELETE /api/organization/members/delete
 * 
 * Delete a team member (Supabase data)
 * Called from TeamGrid when deleting user
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Create Supabase admin client
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

// Helper to add CORS headers to response
function addCorsHeaders(response, origin) {
  const allowedOrigins = [
    'http://localhost:3000', // SmartGrid Dashboard
    'http://localhost:3001', // TeamGrid Backend
    'http://localhost:3002', // TeamGrid Frontend
    'http://localhost:3002', // BrandGrid
    'http://localhost:3003', // CallGrid
    'http://localhost:3004', // SalesGrid
  ]

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

// Handle OPTIONS preflight request for CORS
export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 200 })
  const origin = request.headers.get('origin')
  
  const allowedOrigins = [
    'http://localhost:3000', // SmartGrid Dashboard
    'http://localhost:3001', // TeamGrid Backend
    'http://localhost:3002', // TeamGrid Frontend
    'http://localhost:3002', // BrandGrid
    'http://localhost:3003', // CallGrid
    'http://localhost:3004', // SalesGrid
  ]

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

export async function DELETE(request) {
  const origin = request.headers.get('origin')
  
  try {
    // Check for Grid Apps API secret (for cross-origin calls from TeamGrid, etc.)
    const authHeader = request.headers.get('authorization')
    const gridAppsSecret = process.env.GRID_APPS_API_SECRET
    
    let isAuthenticated = false
    let authenticatedUserId = null

    // Option 1: Check for Grid Apps API secret
    if (authHeader && authHeader.startsWith('Bearer ') && gridAppsSecret) {
      const token = authHeader.replace('Bearer ', '')
      if (token === gridAppsSecret) {
        console.log('✅ Authenticated via Grid Apps API secret')
        isAuthenticated = true
      }
    }

    // Option 2: Check session (for SmartGrid Dashboard calls)
    if (!isAuthenticated) {
      const supabase = createSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && user) {
        console.log('✅ Authenticated via session:', user.email)
        isAuthenticated = true
        authenticatedUserId = user.id
      }
    }

    // If neither auth method worked, return 401
    if (!isAuthenticated) {
      console.log('❌ Authentication failed - no valid session or API secret')
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return addCorsHeaders(response, origin)
    }

    const body = await request.json()
    const { 
      userId,        // Supabase UUID
      organizationId // Organization ID for validation
    } = body

    // Validate required fields
    if (!userId) {
      const response = NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`🗑️ Deleting user ${userId}`)

    // 1. Check if user exists in organization_members
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('organization_members')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (membershipError || !membership) {
      console.log('⚠️ User not found in organization or already removed')
      const response = NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      )
      return addCorsHeaders(response, origin)
    }

    // 2. Remove user from organization_members
    const { error: removeError } = await supabaseAdmin
      .from('organization_members')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId)

    if (removeError) {
      console.error('❌ Error removing from organization:', removeError)
      const response = NextResponse.json(
        { error: 'Failed to remove user from organization', details: removeError.message },
        { status: 500 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log('✅ User removed from organization')

    // 3. Check if user has other organization memberships
    const { data: otherMemberships, error: otherMembershipsError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)

    if (otherMembershipsError) {
      console.error('⚠️ Error checking other memberships:', otherMembershipsError)
    }

    // 4. If no other memberships, deactivate the user account
    if (!otherMemberships || otherMemberships.length === 0) {
      console.log('🔒 No other memberships found, deactivating user account')
      
      // Deactivate user in auth.users
      const { error: deactivateError } = await createSupabaseAdmin().auth.admin.updateUserById(
        userId,
        { 
          email_confirm: false,
          user_metadata: {
            ...membership.user_metadata,
            status: 'deactivated',
            deactivated_at: new Date().toISOString()
          }
        }
      )

      if (deactivateError) {
        console.error('⚠️ Error deactivating user:', deactivateError)
        // Don't fail the whole request, just log it
      } else {
        console.log('✅ User account deactivated')
      }

      // Update user_profiles status
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          status: 'deactivated',
          deactivated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (profileError) {
        console.error('⚠️ Error updating profile status:', profileError)
        // Don't fail the whole request, just log it
      } else {
        console.log('✅ User profile deactivated')
      }
    } else {
      console.log(`✅ User still has ${otherMemberships.length} other organization memberships, keeping account active`)
    }

    const response = NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      userId: userId,
      accountDeactivated: !otherMemberships || otherMemberships.length === 0
    })
    
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('❌ Error deleting member:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}
