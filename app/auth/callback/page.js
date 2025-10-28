'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, Spin, message } from 'antd'
import { supabase } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const provider = searchParams.get('provider')
        
        // If provider is missing, assume it's Google (since we only support Google OAuth)
        const authProvider = provider || 'google'
        
        console.log('OAuth callback received:', { 
          code: code ? code.substring(0, 10) + '...' : 'null',
          provider: provider || 'null',
          authProvider: authProvider,
          allParams: Object.fromEntries(searchParams.entries())
        })
        
        if (!code) {
          setError(`Invalid callback parameters - Code: ${code ? 'present' : 'missing'}, Provider: ${provider || 'missing'}`)
          setLoading(false)
          return
        }

        // For Google OAuth, we need to handle the callback properly
        // First try to get existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          setLoading(false)
          return
        }

        if (session && session.user) {
          console.log('✅ OAuth login successful (session found):', session.user.email)
          
          // Check if user has organization, if not create one
          await ensureUserHasOrganization(session.user, session)
          
          // Redirect to dashboard
          router.push('/')
        } else {
          // Try to exchange code for session
          console.log('No session found, trying code exchange...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('OAuth exchange error:', exchangeError)
            setError(exchangeError.message)
            setLoading(false)
            return
          }

          if (data.user && data.session) {
            console.log('✅ OAuth login successful (code exchange):', data.user.email)
            
            // Check if user has organization, if not create one
            await ensureUserHasOrganization(data.user, data.session)
            
            // Redirect to dashboard
            router.push('/')
          } else {
            setError('No user data received')
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setError(error.message)
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#141414'
      }}>
        <Card style={{ 
          background: '#1f1f1f', 
          border: '1px solid #303030',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#ffffff' }}>
            Completing Google login...
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#141414'
      }}>
        <Card style={{ 
          background: '#1f1f1f', 
          border: '1px solid #303030',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
            ❌ Login Failed
          </div>
          <div style={{ color: '#bfbfbf', marginBottom: 24 }}>
            {error}
          </div>
          <button 
            onClick={() => router.push('/login')}
            style={{
              background: '#1890ff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </Card>
      </div>
    )
  }

  return null
}

// Helper function to ensure user has organization
async function ensureUserHasOrganization(user, session) {
  try {
    // Use API route instead of direct Supabase admin client
    const response = await fetch('/api/auth/create-organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.email.split('@')[0]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create organization')
    }

    const result = await response.json()
    console.log('✅ Organization created successfully:', result.organizationId)
  } catch (error) {
    console.error('Error ensuring user has organization:', error)
    throw error
  }
}
