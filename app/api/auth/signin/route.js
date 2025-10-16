import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const body = await request.json()
    const { email, password, appId = 'smartgrid-dashboard' } = body

    // Validate
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 401 }
      )
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

    // Check individual member app access
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
      return NextResponse.json(
        { error: 'Member access denied to this application' },
        { status: 403 }
      )
    }

    // Return user data and session
    return NextResponse.json({
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

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

