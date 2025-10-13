import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { priceId, plan } = await request.json()

    console.log('Creating checkout session for:', { priceId, plan })

    // Check Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    // Debug: Log all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log('All cookies:', allCookies.map(c => c.name))
    
    // Create Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            const cookie = cookieStore.get(name)
            console.log(`Cookie ${name}:`, cookie?.value ? 'exists' : 'missing')
            return cookie?.value
          },
        },
      }
    )

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('Auth check:', { user: user?.id, error: userError?.message })

    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return NextResponse.json(
        { 
          error: 'Unauthorized - Please login', 
          details: userError?.message,
          cookies: allCookies.map(c => c.name)
        },
        { status: 401 }
      )
    }

    console.log('User authenticated successfully:', user.id)

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Get or create Stripe customer
    const { data: billing } = await supabaseAdmin
      .from('billing')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = billing?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      console.log('Creating new Stripe customer for:', user.email)
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
      console.log('Created Stripe customer:', customerId)

      // Update billing record with customer ID
      await supabaseAdmin
        .from('billing')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/plans?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_name: plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

