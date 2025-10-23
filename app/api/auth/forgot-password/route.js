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
 * POST /api/auth/forgot-password
 * 
 * Universal forgot password endpoint for ALL apps
 * TeamGrid, BrandGrid, CallGrid, SalesGrid can ALL use this!
 * 
 * Body: {
 *   email: string,
 *   appId?: string  // Which app is user requesting from
 * }
 */
export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    const body = await request.json()
    const { email, appId = 'smartgrid-dashboard' } = body

    // Validate
    if (!email) {
      const response = NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    console.log(`🔐 Forgot password request: ${email} from ${appId}`)

    // ✅ UNIVERSAL: Check if user exists in Supabase Auth
    // This works for ALL Grid apps (TeamGrid, BrandGrid, CallGrid, etc.)
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      const response = NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
      return addCorsHeaders(response, origin)
    }

    // Check if email exists in auth users
    const userExists = authUsers?.users?.find(u => u.email === email)
    
    if (!userExists) {
      console.log(`⚠️ User not found: ${email} (requested from ${appId})`)
      const response = NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`✅ User found: ${email} (requested from ${appId})`)

    // Send password reset email using Supabase
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?app=${appId}`,
    })

    if (error) {
      console.error('❌ Password reset error:', error)
      const response = NextResponse.json(
        { error: error.message || 'Failed to send reset email' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    console.log(`✅ Password reset email sent to: ${email} (from ${appId})`)

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.',
      data: {
        email: email,
        appId: appId
      }
    })
    return addCorsHeaders(response, origin)

  } catch (error) {
    console.error('❌ Forgot password error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}
