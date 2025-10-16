import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Create admin client for database operations
function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

/**
 * POST /api/credits/consume
 * Consumes credits for a specific action
 * 
 * Body: {
 *   action: string,        // e.g., 'brandgrid_generate_logo'
 *   credits: number,       // amount of credits to consume
 *   metadata: object       // optional metadata about the action
 * }
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies()
    
    // Authenticate user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { action, credits, metadata = {} } = body

    if (!action || !credits || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid request. "action" and "credits" (positive number) are required.' },
        { status: 400 }
      )
    }

    // Create Supabase admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Get current billing info
    const { data: billing, error: billingError } = await supabaseAdmin
      .from('billing')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (billingError || !billing) {
      return NextResponse.json(
        { error: 'Billing information not found' },
        { status: 404 }
      )
    }

    // Calculate available credits
    const totalCredits = billing.total_credits || 0
    const usedCredits = billing.used_credits || 0
    const availableCredits = totalCredits - usedCredits

    // Check if user has enough credits
    if (availableCredits < credits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          available: availableCredits,
          required: credits,
          shortfall: credits - availableCredits
        },
        { status: 402 } // Payment Required
      )
    }

    // Check subscription status
    if (billing.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 403 }
      )
    }

    // Consume credits (update used_credits)
    const { data: updatedBilling, error: updateError } = await supabaseAdmin
      .from('billing')
      .update({
        used_credits: usedCredits + credits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to consume credits' },
        { status: 500 }
      )
    }

    // Log credit transaction
    const { error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        action,
        credits_used: credits,
        credits_remaining: (totalCredits - (usedCredits + credits)),
        metadata,
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('⚠️ Warning: Failed to log transaction:', transactionError)
      // Don't fail the request if transaction logging fails
    }

    // Return success with updated credit info
    const newAvailableCredits = updatedBilling.total_credits - updatedBilling.used_credits

    console.log(`✅ Credits consumed: ${credits} for ${action}`)
    console.log(`   User: ${user.email}`)
    console.log(`   Remaining: ${newAvailableCredits}/${updatedBilling.total_credits}`)

    return NextResponse.json({
      success: true,
      action,
      credits_consumed: credits,
      credits_remaining: newAvailableCredits,
      total_credits: updatedBilling.total_credits,
      used_credits: updatedBilling.used_credits,
      percentage_used: Math.round((updatedBilling.used_credits / updatedBilling.total_credits) * 100)
    })

  } catch (error) {
    console.error('❌ Error in credits consumption:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

