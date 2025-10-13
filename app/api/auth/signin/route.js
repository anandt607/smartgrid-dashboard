import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

