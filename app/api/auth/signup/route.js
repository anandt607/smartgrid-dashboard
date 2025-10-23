import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper to add CORS headers to response
function addCorsHeaders(response, origin) {
  const allowedOrigins = [
    'http://localhost:3000', // SmartGrid Dashboard
    'http://localhost:3001', // TeamGrid Backend
    'http://localhost:3002', // TeamGrid Frontend
    'http://localhost:3003', // CallGrid
    'http://localhost:3004', // SalesGrid
    // Add production URLs if needed
    'https://smartgrid-dashboard.vercel.app',
    'https://teamgrid-frontend.vercel.app',
    'https://brandgrid-frontend.vercel.app',
    'https://callgrid-frontend.vercel.app',
    'https://salesgrid-frontend.vercel.app'
  ]

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-App-Source')
  } else {
    // For development, allow any localhost origin
    if (origin && origin.startsWith('http://localhost:')) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-App-Source')
    }
  }
  
  return response
}

// Handle OPTIONS preflight request for CORS
export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 200 })
  const origin = request.headers.get('origin')
  return addCorsHeaders(response, origin)
}

/**
 * POST /api/auth/signup
 * 
 * Universal signup endpoint for ALL apps
 * BrandGrid, CallGrid, SalesGrid, TeamGrid can ALL use this!
 * 
 * Body: {
 *   email: string,
 *   password: string,
 *   fullName?: string,
 *   organizationName?: string,  // NEW: Organization name
 *   appId?: string  // Which app is user signing up from
 * }
 */
export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    const body = await request.json()
    const { email, password, fullName, organizationName, appId = 'smartgrid-dashboard' } = body

    // Validate
    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    if (password.length < 8) {
      const response = NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    console.log(`📝 Signup attempt: ${email} from ${appId}`)

    // 1. Create user in Supabase Auth using admin client for better control
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName || email.split('@')[0],
        signup_app: appId, // Track which app they signed up from
      },
      email_confirm: true // Auto-confirm email, no verification required
    })

    if (authError) {
      console.error('❌ Signup error:', authError)
      const response = NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    const user = authData.user
    const session = authData.session

    console.log(`✅ User created: ${user.id}`)

    // Parse full name
    const [firstName, ...lastNameParts] = (fullName || email.split('@')[0]).split(' ')
    const lastName = lastNameParts.join(' ')

    // 2. Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        platform_role: 'user'
      })

    if (profileError) {
      console.error('⚠️ Profile creation error:', profileError)
    }

    // 3. Create organization
    const orgName = organizationName || `${fullName || email.split('@')[0]}'s Organization`
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: orgName,
        owner_id: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (orgError) {
      console.error('❌ Organization creation error:', orgError)
      const response = NextResponse.json(
        { error: 'Failed to create organization', details: orgError.message },
        { status: 500 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`✅ Organization created: ${organization.name}`)

    // 4. Organization billing is auto-created by trigger, but let's verify
    // (The trigger creates it with default 14-day trial)

    // 5. Add user as organization owner
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        role: 'owner',
        is_active: true
      })

    if (memberError) {
      console.error('❌ Member creation error:', memberError)
    } else {
      console.log(`✅ User added as organization owner`)
    }

    // 6. Grant default app access (TeamGrid free)
    const { error: accessError } = await supabaseAdmin
      .from('organization_apps')
      .insert([
        { 
          organization_id: organization.id, 
          app_name: 'teamgrid', 
          has_access: true,
          plan: 'free',
          status: 'active'
        }
      ])

    if (accessError) {
      console.error('⚠️ App access error:', accessError)
    } else {
      console.log(`✅ TeamGrid access granted`)
    }

    // 7. Grant individual member app access
    const { error: memberAccessError } = await supabaseAdmin
      .from('member_app_access')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        app_name: 'teamgrid',
        has_access: true,
        granted_at: new Date().toISOString()
      })

    if (memberAccessError) {
      console.error('⚠️ Member app access error:', memberAccessError)
    } else {
      console.log(`✅ Member TeamGrid access granted`)
    }

    console.log(`✅ User setup complete for ${email}`)

    // 8. Return user data and session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        role: 'owner'
      },
      session: {
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        expires_at: session?.expires_at,
      },
      message: `Account created successfully! Welcome to ${organization.name}. You have a 14-day free trial.`
    })
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('❌ Signup error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}

