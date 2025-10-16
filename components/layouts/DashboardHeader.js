'use client'

import { Avatar, Badge, Dropdown, Space, Tag, Typography } from 'antd'
import { 
  BellOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  ThunderboltOutlined,
  BankOutlined
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { getPlanColor, getInitials } from '@/lib/utils/helpers'

const { Text } = Typography

/**
 * Dashboard header component
 * Shows organization, plan badge, credits, notifications, and user menu
 * @param {Object} user - Current user object
 * @param {Object} billing - Billing information
 * @param {Object} organization - Organization information
 */
export default function DashboardHeader({ user, billing, organization }) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      // AuthProvider will handle the redirect
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {/* Organization Name */}
      {organization?.name && (
        <Space size={6}>
          <BankOutlined style={{ fontSize: 16, color: '#1890ff' }} />
          <Text strong style={{ fontSize: 14 }}>
            {organization.name}
          </Text>
        </Space>
      )}

      {/* Plan Badge */}
      {billing?.plan && (
        <Tag color={getPlanColor(billing.plan)} className="plan-tag">
          {billing.plan.toUpperCase()}
        </Tag>
      )}

      {/* Credits Display */}
      {billing?.credits !== undefined && (
        <Space size={4}>
          <ThunderboltOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <Text strong>{billing.credits.toLocaleString()}</Text>
          <Text type="secondary">credits</Text>
        </Space>
      )}

      {/* Notifications */}
      <Badge count={0} showZero={false}>
        <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
      </Badge>

      {/* User Menu */}
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Avatar 
            src={user?.user_metadata?.avatar_url} 
            icon={<UserOutlined />}
          >
            {!user?.user_metadata?.avatar_url && getInitials(user?.user_metadata?.full_name || user?.email)}
          </Avatar>
          <Text strong className="hide-mobile">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </Text>
        </div>
      </Dropdown>
    </div>
  )
}
