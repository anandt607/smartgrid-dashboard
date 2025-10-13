// Plan types
export const PLANS = {
  FREE: 'free',
  PRO: 'standard', // Changed to match Stripe
  ENTERPRISE: 'enterprise',
}

// Plan details
export const PLAN_DETAILS = {
  [PLANS.FREE]: {
    name: 'Base',
    price: 0,
    priceINR: '₹0',
    color: 'default',
    features: [
      'Access to all 4 grids (Limited)',
      '100 credits per month',
      'BrandGrid: Basic features',
      'CallGrid: 10 calls/day',
      'SalesGrid: View only',
      'TeamGrid: 5 members max',
      'Email support',
    ],
    credits: 100,
    grids: ['brandgrid', 'callgrid', 'salesgrid', 'teamgrid'],
  },
  [PLANS.PRO]: {
    name: 'Standard',
    price: 999,
    priceINR: '₹999',
    color: 'blue',
    features: [
      'Full access to all 4 grids',
      '1,000 credits per month',
      'BrandGrid: All features',
      'CallGrid: Unlimited calls',
      'SalesGrid: Full analytics',
      'TeamGrid: 50 members',
      'Priority support',
      'API access (limited)',
    ],
    credits: 1000,
    grids: ['brandgrid', 'callgrid', 'salesgrid', 'teamgrid'],
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
  },
  [PLANS.ENTERPRISE]: {
    name: 'Enterprise',
    price: 4999,
    priceINR: '₹4,999',
    color: 'purple',
    features: [
      'Unlimited access to all grids',
      '10,000 credits per month',
      'Full API access',
      'Unlimited team members',
      'Custom integrations',
      '24/7 phone support',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    credits: 10000,
    grids: ['brandgrid', 'callgrid', 'salesgrid', 'teamgrid'],
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  },
}

// Subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
}

// Query keys for TanStack Query
export const QUERY_KEYS = {
  USER: ['user'],
  BILLING: (userId) => ['billing', userId],
  APPS: (userId) => ['apps', userId],
  APP: (appId, userId) => ['app', appId, userId],
  INVOICES: (userId, page) => ['invoices', userId, page],
  SUBSCRIPTION: (userId) => ['subscription', userId],
  PAYMENT_METHODS: (customerId) => ['payment-methods', customerId],
}

// API routes
export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    DELETE: '/api/user/delete',
  },
  BILLING: {
    INFO: '/api/billing/info',
    CHECKOUT: '/api/billing/create-checkout',
    PORTAL: '/api/billing/create-portal',
    CANCEL: '/api/billing/cancel-subscription',
    UPDATE: '/api/billing/update-subscription',
  },
  APPS: {
    LIST: '/api/apps',
    DETAIL: (id) => `/api/apps/${id}`,
  },
}

// Table pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

// Message duration
export const MESSAGE_DURATION = 3 // seconds

// Avatar placeholder
export const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/100'

// App icons (you can replace with actual icon URLs)
export const APP_ICONS = {
  DEFAULT: '📱',
  ANALYTICS: '📊',
  CHAT: '💬',
  EMAIL: '📧',
  CALENDAR: '📅',
  STORAGE: '☁️',
  VIDEO: '🎥',
  PHOTOS: '📷',
}
