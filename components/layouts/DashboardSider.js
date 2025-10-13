'use client'

import { Menu } from 'antd'
import {
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  CreditCardOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from '@/lib/api/auth'

/**
 * Dashboard sidebar navigation menu
 */
export default function DashboardSider() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Determine selected key based on current pathname
  const getSelectedKey = () => {
    if (pathname === '/') return 'apps'
    if (pathname.startsWith('/profile')) return 'profile'
    if (pathname.startsWith('/settings')) return 'settings'
    if (pathname.startsWith('/billing')) return 'billing'
    if (pathname.startsWith('/apps')) return 'apps'
    return 'apps'
  }

  const menuItems = [
    {
      key: 'apps',
      icon: <AppstoreOutlined />,
      label: 'My Apps',
      onClick: () => router.push('/'),
    },
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
      key: 'billing',
      icon: <CreditCardOutlined />,
      label: 'Billing',
      onClick: () => router.push('/billing'),
    },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{ flex: 1, borderRight: 0 }}
      />
      
      {/* Bottom section with logout */}
      <div className="sidebar-bottom">
        <Menu
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
            },
          ]}
          selectable={false}
        />
      </div>
    </div>
  )
}
