import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client for creating users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Regular client for user operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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
 *   appId?: string  // Which app is user signing up from
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, fullName, appId = 'smartgrid-dashboard' } = body

    // Validate
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    console.log(`📝 Signup attempt: ${email} from ${appId}`)

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          signup_app: appId, // Track which app they signed up from
        }
      }
    })

    if (authError) {
      console.error('❌ Signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const user = authData.user
    const session = authData.session

    console.log(`✅ User created: ${user.id}`)

    // 2. Create billing record (Base plan with 100 credits)
    const { error: billingError } = await supabaseAdmin
      .from('billing')
      .insert({
        user_id: user.id,
        plan: 'free',
        status: 'active',
        total_credits: 100,
        used_credits: 0,
        credit_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
      })

    if (billingError) {
      console.error('⚠️ Billing creation error:', billingError)
      // Don't fail signup if billing fails - can be created later
    }

    // 3. Grant access to all 4 grids (Base plan)
    const { error: accessError } = await supabaseAdmin
      .from('app_access')
      .insert([
        { user_id: user.id, app_id: 'brandgrid', has_access: true },
        { user_id: user.id, app_id: 'callgrid', has_access: true },
        { user_id: user.id, app_id: 'salesgrid', has_access: true },
        { user_id: user.id, app_id: 'teamgrid', has_access: true },
      ])

    if (accessError) {
      console.error('⚠️ App access error:', accessError)
    }

    console.log(`✅ User setup complete for ${email}`)

    // 4. Return user data and session
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
      },
      session: {
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
        expires_at: session?.expires_at,
      },
      message: 'Account created successfully! You can now access all SmartGrid apps.'
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

