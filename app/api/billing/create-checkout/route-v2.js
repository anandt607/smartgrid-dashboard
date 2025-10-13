import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { priceId, plan } = await request.json()

    console.log('=== CREATE CHECKOUT START ===')
    console.log('Request:', { priceId, plan })

    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY missing')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase credentials missing')
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Create Supabase client with SSR support
    const cookieStore = cookies()
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Auth failed:', authError?.message || 'No user')
      return NextResponse.json(
        { error: 'Please login to continue', details: authError?.message },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Get or create Stripe customer
    const { data: billing } = await supabase
      .from('billing')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = billing?.stripe_customer_id

    if (!customerId) {
      console.log('Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      console.log('✅ Stripe customer created:', customerId)

      // Update billing with admin privileges
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        {
          cookies: {
            get(name) {
              return cookieStore.get(name)?.value
            },
          },
        }
      )

      const { error: updateError } = await supabaseAdmin
        .from('billing')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        console.error('❌ Failed to update billing:', updateError)
      }
    } else {
      console.log('✅ Using existing Stripe customer:', customerId)
    }

    // Create Stripe Checkout Session
    console.log('Creating Stripe checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/plans?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_name: plan,
      },
    })

    console.log('✅ Checkout session created:', session.id)
    console.log('=== CREATE CHECKOUT END ===')

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('❌ Checkout error:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

