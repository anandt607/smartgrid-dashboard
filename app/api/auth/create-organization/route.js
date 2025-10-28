import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { userId, userEmail, userName } = await request.json()
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Check if user already has organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId)
      .single()

    if (userOrg && !orgError) {
      console.log('✅ User already has organization:', userOrg.organization_id)
      return NextResponse.json({
        success: true,
        organizationId: userOrg.organization_id,
        message: 'User already has organization'
      })
    }

    // Create organization for new Google user
    console.log('Creating organization for Google user:', userEmail)
    
    const orgName = `${userName}'s Organization`
    const { data: organization, error: orgCreateError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: orgName,
        owner_id: userId,
        status: 'active'
      })
      .select()
      .single()

    if (orgCreateError) {
      console.error('Organization creation error:', orgCreateError)
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgCreateError.message },
        { status: 500 }
      )
    }

    // Add user as organization owner
    await supabaseAdmin
      .from('organization_members')
      .insert({
        user_id: userId,
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

    console.log('✅ Organization created successfully:', organization.id)

    return NextResponse.json({
      success: true,
      organizationId: organization.id,
      organizationName: organization.name,
      message: 'Organization created successfully'
    })

  } catch (error) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
