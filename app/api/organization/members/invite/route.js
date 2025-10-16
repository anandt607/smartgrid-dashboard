/**
 * POST /api/organization/members/invite
 * 
 * Invite a new team member to organization
 */

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { handleCors } from '@/lib/cors'

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

// Helper to add CORS headers to response
function addCorsHeaders(response, origin) {
  const allowedOrigins = [
    'http://localhost:3000', // SmartGrid Dashboard
    'http://localhost:3001', // TeamGrid Backend
    'http://localhost:3002', // TeamGrid Frontend
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

export async function POST(request) {
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
        // For cross-origin calls, we won't have a specific user
        // The organizationId will be validated separately
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
      firstName, 
      lastName, 
      email, 
      password = crypto.randomBytes(12).toString('hex'), // Generate password if not provided
      organizationId,
      role = 'member',
      apps = ['teamgrid'] // Default app access
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !organizationId) {
      const response = NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, organizationId' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`👥 Adding ${email} to organization ${organizationId}`)

    // 1. Check if current user can add members to this organization
    // Skip permission check if authenticated via API secret (trusted Grid apps)
    if (authenticatedUserId) {
      const { data: membership } = await createSupabaseAdmin()
        .from('organization_members')
        .select('role')
        .eq('user_id', authenticatedUserId)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        const response = NextResponse.json(
          { error: 'You do not have permission to add members to this organization' },
          { status: 403 }
        )
        return addCorsHeaders(response, origin)
      }
    } else {
      console.log('✅ Skipping permission check (authenticated via API secret)')
    }

    // 2. Check if user already exists with this email
    const { data: { users: existingUsers } } = await createSupabaseAdmin().auth.admin.listUsers()
    const existingUser = existingUsers.find(u => u.email === email)
    
    let newUserId

    if (existingUser) {
      // User exists, check if already member
      const { data: existingMembership } = await createSupabaseAdmin()
        .from('organization_members')
        .select('*')
        .eq('user_id', existingUser.id)
        .eq('organization_id', organizationId)
        .single()

      if (existingMembership) {
        const response = NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        )
        return addCorsHeaders(response, origin)
      }

      newUserId = existingUser.id
      console.log(`✅ User exists: ${newUserId}`)
    } else {
      // Create new user directly (no invitation needed)
      const { data: newUser, error: createError } = await createSupabaseAdmin().auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        },
        email_confirm: true // Auto-confirm email
      })

      if (createError) {
        console.error('❌ Error creating user:', createError)
        const response = NextResponse.json(
          { error: 'Failed to create user', details: createError.message },
          { status: 500 }
        )
        return addCorsHeaders(response, origin)
      }

      newUserId = newUser.user.id
      console.log(`✅ User created: ${newUserId}`)

      // Create user profile
      const { error: profileError } = await createSupabaseAdmin()
        .from('user_profiles')
        .insert({
          user_id: newUserId,
          first_name: firstName,
          last_name: lastName,
          platform_role: 'user'
        })

      if (profileError) {
        console.error('⚠️ Profile creation error:', profileError)
      }
    }

    // 3. Add user to organization
    const { error: memberError } = await createSupabaseAdmin()
      .from('organization_members')
      .insert({
        user_id: newUserId,
        organization_id: organizationId,
        role: role,
        is_active: true
      })

    if (memberError) {
      console.error('❌ Member creation error:', memberError)
      const response = NextResponse.json(
        { error: 'Failed to add user to organization', details: memberError.message },
        { status: 500 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`✅ User added to organization as ${role}`)

    // 4. Grant app access
    const appAccessPromises = apps.map(async (appName) => {
      const { error } = await createSupabaseAdmin()
        .from('organization_apps')
        .upsert({
          organization_id: organizationId,
          app_name: appName,
          has_access: true,
          plan: 'free', // Default plan
          status: 'active'
        }, {
          onConflict: 'organization_id,app_name'
        })

      if (error) {
        console.error(`⚠️ Error granting ${appName} access:`, error)
      } else {
        console.log(`✅ Granted ${appName} access`)
      }
    })

    await Promise.all(appAccessPromises)

    const response = NextResponse.json({
      success: true,
      message: `${firstName} has been added successfully`,
      userId: newUserId,
      email: email,
      password: existingUser ? undefined : password, // Return password only for new users
      role: role,
      apps: apps
    })
    
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('Error inviting member:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}
