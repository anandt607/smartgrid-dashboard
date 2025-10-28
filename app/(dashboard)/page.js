'use client'

import { Space, message, Row, Col } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import QuickStats from '@/components/dashboard/QuickStats'
import AppsGrid from '@/components/dashboard/AppsGrid'
import OrganizationCard from '@/components/dashboard/OrganizationCard'
import CreditsCard from '@/components/billing/CreditsCard'
import LoadingState from '@/components/shared/LoadingState'
import ErrorState from '@/components/shared/ErrorState'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useApps } from '@/lib/hooks/queries/useApps'
import { useBilling } from '@/lib/hooks/queries/useBilling'
import { trackAppUsage } from '@/lib/api/apps'
import { supabase } from '@/lib/supabase/client'

/**
 * Main dashboard page
 * Shows quick stats and apps grid
 */
export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: user } = useUser()
  const { data: apps, isLoading, error, refetch } = useApps(user?.id)
  const { data: billing, isLoading: billingLoading } = useBilling(user?.id)
  
  // Get primary organization
  const organization = user?.organizations?.[0]

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code')
      const provider = searchParams.get('provider')
      
      console.log('Dashboard OAuth check:', { 
        code: code ? code.substring(0, 10) + '...' : 'null',
        provider: provider || 'null',
        allParams: Object.fromEntries(searchParams.entries())
      })
      
      if (code) {
        console.log('OAuth callback detected on dashboard:', { 
          code: code.substring(0, 10) + '...', 
          provider: provider || 'unknown' 
        })
        
        try {
          // For Google OAuth, we need to use the proper callback URL
          // The session should be automatically set by Supabase
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            message.error('Google login failed: ' + sessionError.message)
            return
          }

          if (session && session.user) {
            console.log('✅ OAuth login successful (session found):', session.user.email)
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // Force page reload to update auth state
            window.location.reload()
          } else {
            // Try to exchange code for session as fallback
            console.log('No session found, trying code exchange...')
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('OAuth exchange error:', exchangeError)
              message.error('Google login failed: ' + exchangeError.message)
              return
            }

            if (data.user && data.session) {
              console.log('✅ OAuth login successful (code exchange):', data.user.email)
              
              // Clear URL parameters
              window.history.replaceState({}, document.title, window.location.pathname)
              
              // Force page reload to update auth state
              window.location.reload()
            } else {
              console.error('No user data received from OAuth exchange')
              message.error('Google login failed - no user data')
            }
          }
        } catch (error) {
          console.error('OAuth callback error:', error)
          message.error('Google login failed: ' + error.message)
        }
      }
    }

    handleOAuthCallback()
  }, [searchParams])

  // Handle app launch
  const handleLaunch = async (app) => {
    try {
      // Track app usage
      await trackAppUsage(user.id, app.id)
      
      // Special SSO handling for TeamGrid
      if (app.name?.toLowerCase().includes('teamgrid') || app.id === 'teamgrid') {
        message.loading('Launching TeamGrid...', 1)
        
        // Get current session token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          message.error('Authentication error. Please login again.')
          return
        }
        
        const token = session.access_token
        const teamGridUrl = process.env.NEXT_PUBLIC_TEAMGRID_URL || app.url || 'http://localhost:3002'
        
        // Open TeamGrid with token (SSO)
        const ssoUrl = `${teamGridUrl}/sso-login?token=${token}`
        window.open(ssoUrl, '_blank')
        
        message.success('TeamGrid launched! 🎉')
        return
      }
      
      // Navigate to app page or external URL (other apps)
      if (app.url) {
        window.open(app.url, '_blank')
      } else {
        router.push(`/apps/${app.id}`)
      }
    } catch (error) {
      console.error('Error launching app:', error)
      message.error('Failed to launch app')
    }
  }

  // Handle upgrade click
  const handleUpgrade = () => {
    router.push('/billing/plans')
  }

  // Calculate quick stats from apps data
  const stats = {
    totalApps: apps?.length || 0,
    activeUsers: apps?.filter(app => app.hasAccess).length || 0,
    creditsUsed: billing?.used_credits || 0,
    revenue: 0, // This would come from Stripe data
  }

  // Don't show error state for apps - just log it and continue
  if (error) {
    console.warn('Apps loading error (non-critical):', error)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Organization Overview */}
      <OrganizationCard organization={organization} loading={!user} />

      {/* Credits Card & Quick Stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <CreditsCard billing={billing} loading={billingLoading} />
        </Col>
        <Col xs={24} lg={16}>
          <QuickStats stats={stats} loading={isLoading || billingLoading} />
        </Col>
      </Row>

      {/* Apps Section */}
      <div>
        {isLoading ? (
          <LoadingState tip="Loading apps..." />
        ) : (
          <AppsGrid
            apps={apps || []}
            onLaunch={handleLaunch}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
    </Space>
  )
}
