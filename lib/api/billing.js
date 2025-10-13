import apiClient from './client'
import { supabase } from '@/lib/supabase/client'

// Get user's billing information
export const getBillingInfo = async (userId) => {
  const { data, error } = await supabase
    .from('billing')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw error
  }
  
  // Calculate available credits (total - used)
  const availableCredits = data 
    ? (data.total_credits || 0) - (data.used_credits || 0)
    : 100 // Default 100 credits for free plan
  
  // Return default billing info if none exists
  return data ? {
    ...data,
    credits: availableCredits,
    total_credits: data.total_credits || 100,
    used_credits: data.used_credits || 0,
  } : {
    user_id: userId,
    plan: 'free',
    status: 'active',
    credits: 100,
    total_credits: 100,
    used_credits: 0,
    stripe_customer_id: null,
    stripe_subscription_id: null,
  }
}

// Get user's subscription details
export const getSubscription = async (userId) => {
  try {
    const { data } = await apiClient.get(`/api/billing/subscription/${userId}`)
    return data
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Create checkout session for plan upgrade
export const createCheckoutSession = async ({ plan, priceId }) => {
  const { data } = await apiClient.post('/api/billing/create-checkout', {
    plan,
    priceId,
  })
  return data
}

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  const { data } = await apiClient.post('/api/billing/cancel-subscription', {
    subscriptionId,
  })
  return data
}

// Update subscription
export const updateSubscription = async ({ subscriptionId, newPriceId }) => {
  const { data } = await apiClient.post('/api/billing/update-subscription', {
    subscriptionId,
    newPriceId,
  })
  return data
}

// Get invoices
export const getInvoices = async (userId, { page = 1, limit = 10 } = {}) => {
  // TODO: Implement Stripe invoice fetching or create invoices table
  // For now, return empty array
  return {
    invoices: [],
    page,
    limit,
    total: 0,
  }
  
  // Future implementation:
  // const { data, error } = await supabase
  //   .from('billing_invoices')
  //   .select('*', { count: 'exact' })
  //   .eq('user_id', userId)
  //   .order('created_at', { ascending: false })
  //   .range((page - 1) * limit, page * limit - 1)
  // 
  // if (error) throw error
  // 
  // return {
  //   invoices: data || [],
  //   page,
  //   limit,
  //   total: data?.length || 0,
  // }
}

// Add credits
export const addCredits = async ({ userId, amount, description }) => {
  const { data, error } = await supabase
    .from('billing')
    .update({
      credits: supabase.raw(`credits + ${amount}`),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get payment methods
export const getPaymentMethods = async (customerId) => {
  try {
    const { data } = await apiClient.get(`/api/billing/payment-methods/${customerId}`)
    return data
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

// Create portal session for managing billing
export const createPortalSession = async () => {
  const { data } = await apiClient.post('/api/billing/create-portal')
  return data
}
