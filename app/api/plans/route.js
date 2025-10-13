import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Fetch all active plans with features (USD by default)
    const { data: plans, error } = await supabase
      .from('plans')
      .select(`
        *,
        plan_features (*)
      `)
      .eq('active', true)
      .eq('currency', 'usd') // Fetch USD prices
      .order('sort_order')
      
    if (error) {
      console.error('Error fetching plans:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform for frontend
    const transformedPlans = plans.map(plan => ({
      id: plan.stripe_price_id,
      name: plan.name,
      description: plan.description,
      price: plan.price_amount / 100,
      priceDisplay: plan.currency === 'usd' ? 
        `$${plan.price_amount / 100}` : 
        `₹${(plan.price_amount / 100).toLocaleString('en-IN')}`,
      currency: plan.currency,
      interval: plan.billing_interval,
      credits: plan.credits,
      features: plan.features || [],
      metadata: plan.metadata || {},
      gridAccess: plan.plan_features.reduce((acc, feature) => {
        acc[feature.grid_name] = {
          level: feature.access_level,
          dailyLimit: feature.daily_limit,
          features: feature.features || {}
        }
        return acc
      }, {}),
      isFree: plan.price_amount === 0,
      isPopular: plan.name.includes('Standard'),
      sortOrder: plan.sort_order
    }))
    
    return NextResponse.json(transformedPlans)
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
