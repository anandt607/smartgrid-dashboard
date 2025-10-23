import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper to add CORS headers to response
function addCorsHeaders(response, origin) {
  const allowedOrigins = [
    'http://localhost:3000', // SmartGrid Dashboard
    'http://localhost:3001', // TeamGrid Backend
    'http://localhost:3002', // TeamGrid Frontend
    'http://localhost:3003', // CallGrid
    'http://localhost:3004', // SalesGrid
    // Add production URLs if needed
    'https://smartgrid-dashboard.vercel.app',
    'https://teamgrid-frontend.vercel.app',
    'https://brandgrid-frontend.vercel.app',
    'https://callgrid-frontend.vercel.app',
    'https://salesgrid-frontend.vercel.app'
  ]

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-App-Source')
  } else {
    // For development, allow any localhost origin
    if (origin && origin.startsWith('http://localhost:')) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-App-Source')
    }
  }
  
  return response
}

// Handle OPTIONS preflight request for CORS
export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 200 })
  const origin = request.headers.get('origin')
  return addCorsHeaders(response, origin)
}

/**
 * POST /api/auth/reset-password
 * 
 * Universal reset password endpoint for ALL apps
 * TeamGrid, BrandGrid, CallGrid, SalesGrid can ALL use this!
 * 
 * Body: {
 *   password: string,
 *   confirmPassword: string,
 *   appId?: string  // Which app is user resetting from
 * }
 */
export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    const body = await request.json()
    const { password, confirmPassword, appId = 'smartgrid-dashboard' } = body

    // Validate
    if (!password || !confirmPassword) {
      const response = NextResponse.json(
        { error: 'Password and confirm password are required' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    if (password !== confirmPassword) {
      const response = NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    if (password.length < 8) {
      const response = NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    console.log(`🔐 Reset password request from ${appId}`)

    // Check if this is a direct API call (not from email link)
    const referer = request.headers.get('referer')
    const isFromEmailLink = referer && referer.includes('reset-password')
    
    if (!isFromEmailLink) {
      const response = NextResponse.json(
        { 
          error: 'Please use the password reset link from your email. Direct API calls are not supported for security reasons.',
          message: 'To reset your password, please click the link in the email we sent you.'
        },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    // For password reset from email link, we need to handle session properly
    // This should be handled by the frontend with proper session management
    const response = NextResponse.json(
      { 
        error: 'Password reset must be done through the email link with proper session.',
        message: 'Please use the reset password page accessed through the email link.'
      },
      { status: 400 }
    )
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('❌ Reset password error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}
