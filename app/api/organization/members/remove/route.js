/**
 * DELETE /api/organization/members/remove
 * 
 * Remove a member from organization
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

export async function DELETE(request) {
  try {
    // Get current user from session
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, organizationId } = body

    // Validate required fields
    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, organizationId' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Removing user ${userId} from organization ${organizationId}`)

    // Create Supabase admin client for database operations
    const supabaseAdmin = createSupabaseAdmin()

    // 1. Check if current user can remove members from this organization
    const { data: currentUserMembership } = await supabaseAdmin
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (!currentUserMembership || (currentUserMembership.role !== 'owner' && currentUserMembership.role !== 'admin')) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members from this organization' },
        { status: 403 }
      )
    }

    // 2. Get target user's membership
    const { data: targetMembership } = await supabaseAdmin
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (!targetMembership) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 404 }
      )
    }

    // 3. Prevent removing the organization owner (unless removing self)
    if (targetMembership.role === 'owner' && userId !== user.id) {
      return NextResponse.json(
        { error: 'Cannot remove organization owner' },
        { status: 403 }
      )
    }

    // 4. Prevent non-owners from removing admins
    if (currentUserMembership.role !== 'owner' && targetMembership.role === 'admin') {
      return NextResponse.json(
        { error: 'Only organization owners can remove admins' },
        { status: 403 }
      )
    }

    // 5. Remove user from organization (soft delete)
    const { error: removeError } = await supabaseAdmin
      .from('organization_members')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('organization_id', organizationId)

    if (removeError) {
      console.error('❌ Error removing member:', removeError)
      return NextResponse.json(
        { error: 'Failed to remove member from organization', details: removeError.message },
        { status: 500 }
      )
    }

    console.log(`✅ User removed from organization`)

    // 6. Get user info for response
    const { data: authUser } = await createSupabaseAdmin().auth.admin.getUserById(userId)
    
    return NextResponse.json({
      success: true,
      message: `User has been removed from the organization`,
      removedUser: {
        id: userId,
        email: authUser?.user?.email || 'Unknown',
        role: targetMembership.role
      }
    })

  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
