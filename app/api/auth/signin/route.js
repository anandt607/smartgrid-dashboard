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

// Handle OAuth callback
export async function GET(request) {
  try {
    const origin = request.headers.get('origin')
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const provider = searchParams.get('provider')
    
    if (provider === 'google' && code) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      )
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Google OAuth error:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      const user = data.user
      const session = data.session
      
      console.log(`✅ Google user logged in: ${user.id}`)
      
      // Check if user has organization
      const { data: userOrg, error: orgError } = await supabaseAdmin
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single()
      
      if (orgError || !userOrg) {
        // Create organization for new Google user
        return await createOrganizationForGoogleUser(user, session, origin)
      }
      
      // Check organization app access
      const { data: orgApp, error: orgAppError } = await supabaseAdmin
        .from('organization_apps')
        .select('has_access')
        .eq('organization_id', userOrg.organization_id)
        .eq('app_name', 'smartgrid-dashboard')
        .single()
      
      if (orgAppError || !orgApp || !orgApp.has_access) {
        const response = NextResponse.json(
          { error: 'Organization does not have access to SmartGrid Dashboard' },
          { status: 403 }
        )
        return addCorsHeaders(response, origin)
      }
      
      // Return success response
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          created_at: user.created_at,
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
        },
        organization: {
          id: userOrg.organization_id,
          role: userOrg.role
        },
        message: 'Google login successful!'
      })
      return addCorsHeaders(response, origin)
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    const response = NextResponse.json(
      { error: 'OAuth callback error', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, request.headers.get('origin'))
  }
}

// Helper function for new Google users
async function createOrganizationForGoogleUser(user, session, origin) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  
  // Create organization
  const orgName = `${user.user_metadata?.full_name || user.email.split('@')[0]}'s Organization`
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
    console.error('Organization creation error:', orgError)
    const response = NextResponse.json(
      { error: 'Failed to create organization', details: orgError.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
  
  // Add user as organization owner
  await supabaseAdmin
    .from('organization_members')
    .insert({
      user_id: user.id,
      organization_id: organization.id,
      role: 'owner',
      is_active: true
    })
  
  // Grant SmartGrid Dashboard access
  await supabaseAdmin
    .from('organization_apps')
    .insert({
      organization_id: organization.id,
      app_name: 'smartgrid-dashboard',
      has_access: true,
      plan: 'free',
      status: 'active'
    })
  
  // Grant TeamGrid access
  await supabaseAdmin
    .from('organization_apps')
    .insert({
      organization_id: organization.id,
      app_name: 'teamgrid',
      has_access: true,
      plan: 'free',
      status: 'active'
    })
  
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      created_at: user.created_at,
    },
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      role: 'owner'
    },
    message: `Welcome to ${organization.name}! Your account has been created successfully.`
  })
  return addCorsHeaders(response, origin)
}

/**
 * POST /api/auth/signin
 * 
 * Universal login endpoint for ALL apps
 * BrandGrid, CallGrid, SalesGrid, TeamGrid can ALL use this!
 * 
 * Body: {
 *   email: string,
 *   password: string,
 *   appId?: string  // Which app is user logging in from
 * }
 */
export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    const body = await request.json()
    const { email, password, appId = 'smartgrid-dashboard' } = body

    // Validate
    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    // Initialize Supabase clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    console.log(`🔐 Login attempt: ${email} from ${appId}`)

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error)
      const response = NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 401 }
      )
      return addCorsHeaders(response, origin)
    }

    const user = data.user
    const session = data.session

    console.log(`✅ User logged in: ${user.id} from ${appId}`)

    // Check member app access for the specific app
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (orgError || !userOrg) {
      return NextResponse.json(
        { error: 'User is not a member of any organization' },
        { status: 403 }
      )
    }

    // Check if organization has access to this app
    const { data: orgApp, error: orgAppError } = await supabaseAdmin
      .from('organization_apps')
      .select('has_access')
      .eq('organization_id', userOrg.organization_id)
      .eq('app_name', appId)
      .single()

    if (orgAppError || !orgApp || !orgApp.has_access) {
      return NextResponse.json(
        { error: 'Organization does not have access to this application' },
        { status: 403 }
      )
    }

    // ✅ SMARTGRID DASHBOARD ACCESS CONTROL
    // Only owners and admins can access SmartGrid Dashboard
    if (appId === 'smartgrid-dashboard') {
      if (userOrg.role !== 'owner' && userOrg.role !== 'admin') {
        const response = NextResponse.json(
          { error: 'Only organization owners and admins can access SmartGrid Dashboard. Members can access individual Grid applications (TeamGrid, BrandGrid, etc.)' },
          { status: 403 }
        )
        return addCorsHeaders(response, origin)
      }
    }

    // Check individual member app access for other apps
    const { data: memberAccess, error: memberAccessError } = await supabaseAdmin
      .from('member_app_access')
      .select('has_access')
      .eq('user_id', user.id)
      .eq('organization_id', userOrg.organization_id)
      .eq('app_name', appId)
      .single()

    // If no specific member record exists, default to true (inherit org access)
    // If member record exists and has_access is false, deny access
    if (memberAccess && !memberAccess.has_access) {
      const response = NextResponse.json(
        { error: 'Member access denied to this application' },
        { status: 403 }
      )
      return addCorsHeaders(response, origin)
    }

    // Return user data and session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        created_at: user.created_at,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      },
      organization: {
        id: userOrg.organization_id,
        role: userOrg.role
      },
      memberAccess: memberAccess,
      message: 'Login successful! You can now access all SmartGrid apps.'
    })
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('❌ Login error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}

