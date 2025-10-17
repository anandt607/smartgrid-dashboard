import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const body = await request.json()
    const { email, password, fullName, organizationName, appId = 'smartgrid-dashboard' } = body

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
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgError.message },
        { status: 500 }
      )
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

    console.log(`✅ User setup complete for ${email}`)

    // 7. Return user data and session
    return NextResponse.json({
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

  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

