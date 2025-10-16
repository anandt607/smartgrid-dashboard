import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    console.log('=== STRIPE WEBHOOK RECEIVED ===')

    if (!signature) {
      console.error('❌ No signature')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log('✅ Event type:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('💳 Checkout completed:', session.id)
        
        const userId = session.metadata?.supabase_user_id
        const planName = session.metadata?.plan_name
        
        if (!userId) {
          console.error('❌ No user ID in metadata')
          break
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        const priceId = subscription.items.data[0].price.id
        
        // Determine plan and credits based on price
        let plan = 'standard'
        let credits = 1000
        
        if (priceId.includes('Enterprise') || planName?.includes('Enterprise')) {
          plan = 'enterprise'
          credits = 10000
        } else if (priceId.includes('Standard') || planName?.includes('Standard')) {
          plan = 'standard'
          credits = 1000
        }

        console.log('📝 Updating billing:', { userId, plan, credits, priceId })

        // Update billing
        const { error: updateError } = await supabase
          .from('billing')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan: plan,
            status: 'active',
            total_credits: credits,
            used_credits: 0,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('❌ Billing update error:', updateError)
        } else {
          console.log('✅ Billing updated successfully')
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('🔄 Subscription updated:', subscription.id)
        
        const { data: billing } = await supabase
          .from('billing')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (billing) {
          const priceId = subscription.items.data[0].price.id
          const status = subscription.status

          await supabase
            .from('billing')
            .update({
              stripe_price_id: priceId,
              status: status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          console.log('✅ Subscription updated')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('❌ Subscription cancelled:', subscription.id)
        
        await supabase
          .from('billing')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('✅ Subscription marked as cancelled')
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('💸 Payment failed:', invoice.id)
        
        await supabase
          .from('billing')
          .update({
            status: 'payment_failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', invoice.subscription)

        console.log('✅ Payment failure recorded')
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        console.log('💰 Invoice paid:', invoice.id)
        
        // Reset credits on successful payment
        const { data: billing } = await supabase
          .from('billing')
          .select('plan')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (billing) {
          const credits = billing.plan === 'enterprise' ? 10000 : 
                         billing.plan === 'standard' ? 1000 : 100

          await supabase
            .from('billing')
            .update({
              status: 'active',
              total_credits: credits,
              used_credits: 0,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription)

          console.log('✅ Credits reset:', credits)
        }
        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    console.log('=== WEBHOOK PROCESSED ===')
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Body parsing is automatically disabled for webhooks in Next.js 14

