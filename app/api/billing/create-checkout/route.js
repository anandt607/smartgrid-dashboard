import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    console.log('=== CHECKOUT API CALLED ===')
    
    const body = await request.json()
    const { priceId, plan } = body
    
    console.log('Request body:', { priceId, plan })

    // Check environment
    console.log('Env check:', {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Get user from cookies (proper way for Next.js App Router)
    const cookieStore = await cookies()
    
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

    // Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Auth result:', { 
      userId: user?.id, 
      email: user?.email,
      error: authError?.message 
    })

    if (authError || !user) {
      console.error('❌ Auth failed:', authError)
      return NextResponse.json({ 
        error: 'Please login to continue',
        details: authError?.message 
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Get billing info
    const { data: billing, error: billingError } = await supabase
      .from('billing')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    console.log('Billing query:', { 
      found: !!billing, 
      customerId: billing?.stripe_customer_id,
      error: billingError?.message 
    })

    let customerId = billing?.stripe_customer_id

    // Create Stripe customer if needed
    if (!customerId) {
      console.log('Creating new Stripe customer...')
      
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      
      customerId = customer.id
      console.log('✅ Stripe customer created:', customerId)

      // Update billing - use upsert to handle missing record
      const { error: updateError } = await supabase
        .from('billing')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'active',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (updateError) {
        console.error('❌ Billing update error:', updateError)
      } else {
        console.log('✅ Billing updated')
      }
    } else {
      console.log('✅ Using existing customer:', customerId)
    }

    // Create Stripe Checkout Session
    console.log('Creating checkout session...')
    
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing/plans?canceled=true`
    
    console.log('URLs:', { successUrl, cancelUrl })
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user.id,
        plan_name: plan,
      },
    })

    console.log('✅ Checkout session created:', session.id)
    console.log('Checkout URL:', session.url)
    console.log('=== CHECKOUT SUCCESS ===')

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('❌ CHECKOUT ERROR:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
