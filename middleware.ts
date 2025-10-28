import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  
  // Check if Supabase credentials are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If Supabase is not configured, allow all routes (development mode)
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
    console.log('⚠️ Supabase not configured - Running in development mode without authentication')
    return res
  }
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Refresh session if it exists but is close to expiry
  if (session) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Session is valid, continue
    } else {
      // Session expired, try to refresh
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
      if (!refreshedSession) {
        // Refresh failed, redirect to login
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  }

  // Check if this is an OAuth callback (has code parameter)
  const isOAuthCallback = req.nextUrl.searchParams.has('code')
  
  console.log('Middleware check:', {
    pathname: req.nextUrl.pathname,
    hasCode: req.nextUrl.searchParams.has('code'),
    hasProvider: req.nextUrl.searchParams.has('provider'),
    isOAuthCallback,
    hasSession: !!session,
    code: req.nextUrl.searchParams.get('code')?.substring(0, 10) + '...',
    provider: req.nextUrl.searchParams.get('provider'),
    allParams: Object.fromEntries(req.nextUrl.searchParams.entries())
  })
  
  // Protected routes - require authentication
  if (req.nextUrl.pathname.startsWith('/profile') ||
      req.nextUrl.pathname.startsWith('/settings') ||
      req.nextUrl.pathname.startsWith('/billing') ||
      req.nextUrl.pathname.startsWith('/apps') ||
      req.nextUrl.pathname.startsWith('/team') ||
      req.nextUrl.pathname === '/') {
    if (!session && !isOAuthCallback) {
      console.log('Redirecting to login - no session and not OAuth callback')
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if (req.nextUrl.pathname.startsWith('/login') || 
      req.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // OAuth callback route - allow without authentication
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/apps/:path*',
    '/team/:path*',
    '/login',
    '/signup',
    '/auth/callback',
  ],
}
