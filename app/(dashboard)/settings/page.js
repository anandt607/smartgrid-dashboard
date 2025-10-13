'use client'

import { Space, Card, Tabs, Switch, Select, Button, Divider, message } from 'antd'
import { 
  BellOutlined, 
  GlobalOutlined, 
  SafetyOutlined,
  KeyOutlined,
  DeleteOutlined 
} from '@ant-design/icons'
import { useState } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import { showConfirm } from '@/components/shared/ConfirmModal'

/**
 * Settings page
 * Allows users to configure app settings and preferences
 */
export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')

  // Handle settings save
  const handleSaveSettings = () => {
    message.success('Settings saved successfully!')
  }

  // Handle account deletion
  const handleDeleteAccount = () => {
    showConfirm({
      title: 'Delete Account',
      content: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      onOk: () => {
        message.info('Account deletion requested. This would delete the account in a real app.')
      },
      danger: true,
      okText: 'Delete Account',
      cancelText: 'Cancel',
    })
  }

  const tabItems = [
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Notifications
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0 }}>Push Notifications</h4>
              <p style={{ color: '#8c8c8c', margin: 0 }}>
                Receive push notifications for important updates
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
          </div>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0 }}>Email Notifications</h4>
              <p style={{ color: '#8c8c8c', margin: 0 }}>
                Receive email notifications for account activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
          </div>

          <Divider />

          <Button type="primary" onClick={handleSaveSettings}>
            Save Notification Settings
          </Button>
        </Space>
      ),
    },
    {
      key: 'preferences',
      label: (
        <span>
          <GlobalOutlined /> Preferences
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <h4>Language</h4>
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: 200 }}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
              ]}
            />
          </div>

          <div>
            <h4>Timezone</h4>
            <Select
              value={timezone}
              onChange={setTimezone}
              style={{ width: 200 }}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Chicago', label: 'Central Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                { value: 'Europe/London', label: 'London' },
                { value: 'Europe/Paris', label: 'Paris' },
                { value: 'Asia/Tokyo', label: 'Tokyo' },
              ]}
            />
          </div>

          <Divider />

          <Button type="primary" onClick={handleSaveSettings}>
            Save Preferences
          </Button>
        </Space>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined /> Security
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <h4>Two-Factor Authentication</h4>
            <p style={{ color: '#8c8c8c' }}>
              Add an extra layer of security to your account
            </p>
            <Button type="primary">Enable 2FA</Button>
          </div>

          <Divider />

          <div>
            <h4>Active Sessions</h4>
            <p style={{ color: '#8c8c8c' }}>
              Manage your active sessions across devices
            </p>
            <Button>View Sessions</Button>
          </div>

          <Divider />

          <div>
            <h4>Login History</h4>
            <p style={{ color: '#8c8c8c' }}>
              Review recent login activity on your account
            </p>
            <Button>View History</Button>
          </div>
        </Space>
      ),
    },
    {
      key: 'api',
      label: (
        <span>
          <KeyOutlined /> API Keys
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <h4>API Access</h4>
            <p style={{ color: '#8c8c8c' }}>
              Generate and manage API keys for programmatic access
            </p>
            <Button type="primary">Generate New Key</Button>
          </div>

          <Divider />

          <div>
            <h4>API Documentation</h4>
            <p style={{ color: '#8c8c8c' }}>
              Learn how to integrate with our API
            </p>
            <Button>View Docs</Button>
          </div>
        </Space>
      ),
    },
    {
      key: 'danger',
      label: (
        <span style={{ color: '#ff4d4f' }}>
          <DeleteOutlined /> Danger Zone
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card
            style={{ background: '#fff1f0', border: '1px solid #ffa39e' }}
          >
            <h4 style={{ color: '#cf1322' }}>Delete Account</h4>
            <p style={{ color: '#8c8c8c', marginBottom: 16 }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button danger onClick={handleDeleteAccount}>
              Delete My Account
            </Button>
          </Card>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Page Header */}
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
        breadcrumb={[{ title: 'Settings' }]}
      />

      {/* Settings Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="notifications"
          items={tabItems}
          tabPosition="left"
        />
      </Card>
    </Space>
  )
}
