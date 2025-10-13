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

const { Header, Sider, Content } = Layout
const { Title } = Typography

/**
 * Main dashboard layout wrapper
 * Provides sidebar navigation, header, and content area
 * @param {ReactNode} children - Page content
 */
export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  
  // Fetch user and billing data
  const { data: user, isLoading: userLoading, error: userError } = useUser()
  const { data: billing, isLoading: billingLoading } = useBilling(user?.id)

  // Show loading state while fetching user data
  if (userLoading) {
    return <LoadingState tip="Loading dashboard..." />
  }

  // Show error state if user data fails to load
  if (userError) {
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
            <h2>SmartGrid</h2>
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
            <DashboardHeader user={user} billing={billing} />
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
