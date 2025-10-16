/**
 * PUT /api/organization/members/update
 * 
 * Update a team member's information (Supabase data)
 * Called from TeamGrid when editing user
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

export async function PUT(request) {
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
      firstName, 
      lastName, 
      email,         // ⚠️ Changing email needs special handling
    } = body

    // Validate required fields
    if (!userId) {
      const response = NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`✏️ Updating user ${userId}`)

    // 1. Update user_profiles (first_name, last_name)
    if (firstName || lastName) {
      const profileUpdate = {}
      if (firstName) profileUpdate.first_name = firstName
      if (lastName) profileUpdate.last_name = lastName

      const { error: profileError } = await createSupabaseAdmin()
        .from('user_profiles')
        .update(profileUpdate)
        .eq('user_id', userId)

      if (profileError) {
        console.error('⚠️ Profile update error:', profileError)
        // Don't fail the whole request, just log it
      } else {
        console.log('✅ Profile updated')
      }
    }

    // 2. Update auth.users (email) - ⚠️ Special handling needed
    if (email) {
      // Get current user email first
      const { data: currentProfile } = await createSupabaseAdmin()
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (currentProfile) {
        // Check if email actually changed
        const { data: { user: currentUser } } = await createSupabaseAdmin().auth.admin.getUserById(userId)
        
        if (currentUser && currentUser.email !== email) {
          console.log(`📧 Changing email from ${currentUser.email} to ${email}`)
          
          // Update email in auth.users
          const { error: emailError } = await createSupabaseAdmin().auth.admin.updateUserById(
            userId,
            { 
              email: email,
              email_confirm: true // Auto-confirm new email
            }
          )

          if (emailError) {
            console.error('❌ Email update error:', emailError)
            const response = NextResponse.json(
              { error: 'Failed to update email', details: emailError.message },
              { status: 500 }
            )
            return addCorsHeaders(response, origin)
          } else {
            console.log('✅ Email updated successfully')
          }
        }
      }
    }

    // 3. Update user metadata (full_name)
    if (firstName && lastName) {
      const { error: metaError } = await createSupabaseAdmin().auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      )

      if (metaError) {
        console.error('⚠️ Metadata update error:', metaError)
        // Don't fail, just log
      } else {
        console.log('✅ User metadata updated')
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'User updated successfully',
      userId: userId
    })
    
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('❌ Error updating member:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}

