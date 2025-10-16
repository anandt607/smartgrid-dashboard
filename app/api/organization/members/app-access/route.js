import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/organization/members/app-access
 * Get app access for organization members
 * 
 * Query params:
 * - organizationId: string (required)
 * - userId?: string (optional - get access for specific user)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Build query
    let query = supabase
      .from('member_app_access')
      .select('*')
      .eq('organization_id', organizationId)

    // If userId is provided, filter for specific user
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: appAccess, error } = await query

    if (error) {
      console.error('❌ Error fetching app access:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch app access', details: error.message },
        { status: 500 }
      )
    }

    // Group by user for easier consumption
    const groupedAccess = appAccess.reduce((acc, access) => {
      const userId = access.user_id
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          apps: {}
        }
      }
      acc[userId].apps[access.app_name] = {
        has_access: access.has_access,
        granted_at: access.granted_at,
        granted_by: access.granted_by
      }
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: groupedAccess,
      count: appAccess.length
    })

  } catch (error) {
    console.error('❌ App access API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organization/members/app-access
 * Update app access for organization members
 * 
 * Body: {
 *   organizationId: string,
 *   userId: string,
 *   appName: string,
 *   hasAccess: boolean,
 *   grantedBy?: string
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      organizationId, 
      userId, 
      appName, 
      hasAccess, 
      grantedBy 
    } = body

    // Validate required fields
    if (!organizationId || !userId || !appName || typeof hasAccess !== 'boolean') {
      return NextResponse.json(
        { error: 'organizationId, userId, appName, and hasAccess are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Check if record exists
    const { data: existingAccess, error: checkError } = await supabase
      .from('member_app_access')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('app_name', appName)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing access:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing access' },
        { status: 500 }
      )
    }

    const accessData = {
      organization_id: organizationId,
      user_id: userId,
      app_name: appName,
      has_access: hasAccess,
      granted_at: new Date().toISOString(),
      granted_by: grantedBy || null
    }

    let result
    if (existingAccess) {
      // Update existing record
      const { data, error } = await supabase
        .from('member_app_access')
        .update(accessData)
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .eq('app_name', appName)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating app access:', error)
        return NextResponse.json(
          { error: 'Failed to update app access' },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('member_app_access')
        .insert(accessData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating app access:', error)
        return NextResponse.json(
          { error: 'Failed to create app access' },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `App access ${hasAccess ? 'granted' : 'revoked'} successfully`
    })

  } catch (error) {
    console.error('❌ App access API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/organization/members/app-access
 * Bulk update app access for a user
 * 
 * Body: {
 *   organizationId: string,
 *   userId: string,
 *   appAccess: {
 *     [appName]: boolean
 *   },
 *   grantedBy?: string
 * }
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { 
      organizationId, 
      userId, 
      appAccess, 
      grantedBy 
    } = body

    // Validate required fields
    if (!organizationId || !userId || !appAccess || typeof appAccess !== 'object') {
      return NextResponse.json(
        { error: 'organizationId, userId, and appAccess are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const results = []
    const errors = []

    // Process each app access
    for (const [appName, hasAccess] of Object.entries(appAccess)) {
      try {
        const accessData = {
          organization_id: organizationId,
          user_id: userId,
          app_name: appName,
          has_access: hasAccess,
          granted_at: new Date().toISOString(),
          granted_by: grantedBy || null
        }

        // Check if record exists
        const { data: existingAccess, error: checkError } = await supabase
          .from('member_app_access')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('user_id', userId)
          .eq('app_name', appName)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        let result
        if (existingAccess) {
          // Update existing record
          const { data, error } = await supabase
            .from('member_app_access')
            .update(accessData)
            .eq('organization_id', organizationId)
            .eq('user_id', userId)
            .eq('app_name', appName)
            .select()
            .single()

          if (error) throw error
          result = data
        } else {
          // Create new record
          const { data, error } = await supabase
            .from('member_app_access')
            .insert(accessData)
            .select()
            .single()

          if (error) throw error
          result = data
        }

        results.push({ appName, result })
      } catch (error) {
        console.error(`❌ Error updating access for ${appName}:`, error)
        errors.push({ appName, error: error.message })
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Updated access for ${results.length} apps${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    })

  } catch (error) {
    console.error('❌ Bulk app access API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organization/members/app-access
 * Remove app access for a user
 * 
 * Body: {
 *   organizationId: string,
 *   userId: string,
 *   appName: string
 * }
 */
export async function DELETE(request) {
  try {
    const body = await request.json()
    const { organizationId, userId, appName } = body

    // Validate required fields
    if (!organizationId || !userId || !appName) {
      return NextResponse.json(
        { error: 'organizationId, userId, and appName are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const { error } = await supabase
      .from('member_app_access')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('app_name', appName)

    if (error) {
      console.error('❌ Error deleting app access:', error)
      return NextResponse.json(
        { error: 'Failed to delete app access' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'App access removed successfully'
    })

  } catch (error) {
    console.error('❌ Delete app access API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
