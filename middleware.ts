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

  // Protected routes - require authentication
  if (req.nextUrl.pathname.startsWith('/profile') ||
      req.nextUrl.pathname.startsWith('/settings') ||
      req.nextUrl.pathname.startsWith('/billing') ||
      req.nextUrl.pathname.startsWith('/apps') ||
      req.nextUrl.pathname === '/') {
    if (!session) {
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

  return res
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/apps/:path*',
    '/login',
    '/signup',
  ],
}
