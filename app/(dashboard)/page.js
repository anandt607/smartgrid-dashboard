'use client'

import { Space, message, Row, Col } from 'antd'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import QuickStats from '@/components/dashboard/QuickStats'
import AppsGrid from '@/components/dashboard/AppsGrid'
import CreditsCard from '@/components/billing/CreditsCard'
import LoadingState from '@/components/shared/LoadingState'
import ErrorState from '@/components/shared/ErrorState'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useApps } from '@/lib/hooks/queries/useApps'
import { useBilling } from '@/lib/hooks/queries/useBilling'
import { trackAppUsage } from '@/lib/api/apps'

/**
 * Main dashboard page
 * Shows quick stats and apps grid
 */
export default function DashboardPage() {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: apps, isLoading, error, refetch } = useApps(user?.id)
  const { data: billing, isLoading: billingLoading } = useBilling(user?.id)

  // Handle app launch
  const handleLaunch = async (app) => {
    try {
      // Track app usage
      await trackAppUsage(user.id, app.id)
      
      // Navigate to app page or external URL
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

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
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
