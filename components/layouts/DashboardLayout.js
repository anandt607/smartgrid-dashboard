'use client'

import { useState } from 'react'
import { Layout, Typography } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import DashboardHeader from './DashboardHeader'
import DashboardSider from './DashboardSider'
import LoadingState from '@/components/shared/LoadingState'
import ErrorState from '@/components/shared/ErrorState'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useBilling } from '@/lib/hooks/queries/useBilling'
import { useAuth } from '@/components/providers/AuthProvider'

const { Header, Sider, Content } = Layout
const { Title } = Typography

/**
 * Main dashboard layout wrapper
 * Provides sidebar navigation, header, and content area
 * @param {ReactNode} children - Page content
 */
export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  
  // Get auth state from AuthProvider
  const { user: authUser, loading: authLoading } = useAuth()
  
  // Fetch user and billing data
  const { data: user, isLoading: userLoading, error: userError } = useUser()
  const { data: billing, isLoading: billingLoading } = useBilling(user?.id)
  
  // Get primary organization from user data
  const organization = user?.organizations?.[0]

  // Log state for debugging
  console.log('DashboardLayout state:', { 
    authLoading,
    authUser: authUser?.email,
    userLoading, 
    hasUser: !!user, 
    hasError: !!userError,
    errorMessage: userError?.message 
  })

  // Show loading state while auth is loading or fetching user data
  if (authLoading || userLoading) {
    return <LoadingState tip="Loading dashboard..." />
  }

  // If no auth user, redirect to login
  if (!authUser) {
    console.log('No auth user, redirecting to login...')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return <LoadingState tip="Redirecting to login..." />
  }

  // If 401 error (not authenticated), redirect to login
  if (userError?.status === 401 || userError?.message?.includes('Unauthorized')) {
    console.log('User not authenticated, redirecting to login...')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return <LoadingState tip="Redirecting to login..." />
  }

  // If no user data (not authenticated), show loading (middleware will redirect)
  if (!user && !userError) {
    return <LoadingState tip="Authenticating..." />
  }

  // If user is explicitly null (auth failed gracefully), redirect to login
  if (user === null) {
    console.log('User is null, redirecting to login...')
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return <LoadingState tip="Redirecting to login..." />
  }

  // Show error state only for real errors (not auth failures)
  if (userError && !userError.message?.includes('Not authenticated')) {
    console.error('DashboardLayout user error:', userError)
    return <ErrorState error={userError} />
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={64}
        width={260}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true)
          }
        }}
        style={{
          overflow: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo/Brand */}
        <div className="sidebar-logo">
          {!collapsed ? (
            <>
              <h2>SmartGrid</h2>
              {/* {organization?.name && (
                <p style={{ 
                  fontSize: 12, 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  margin: 0,
                  marginTop: -8
                }}>
                  {organization.name}
                </p>
              )} */}
            </>
          ) : (
            <h2>SG</h2>
          )}
        </div>

        {/* Navigation Menu */}
        <DashboardSider />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 64 : 260, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            {/* Collapse Toggle */}
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 20,
                padding: '0 24px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* Header Right Content */}
            <DashboardHeader user={user} billing={billing} organization={organization} />
          </div>
        </Header>

        {/* Content */}
        <Content>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}