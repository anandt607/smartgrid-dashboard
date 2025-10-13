'use client'

import { Space, Card, Button, Descriptions, Tag } from 'antd'
import { RocketOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import LoadingState from '@/components/shared/LoadingState'
import ErrorState from '@/components/shared/ErrorState'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useApp } from '@/lib/hooks/queries/useApps'

/**
 * App detail page
 * Shows detailed information about a specific app
 */
export default function AppDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appId = params.appId

  const { data: user } = useUser()
  const { data: app, isLoading, error, refetch } = useApp(appId, user?.id)

  if (isLoading) {
    return <LoadingState tip="Loading app details..." />
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (!app) {
    return <ErrorState error={{ message: 'App not found' }} />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Page Header */}
      <PageHeader
        title={app.name}
        subtitle={app.description}
        breadcrumb={[{ title: 'Apps', href: '/' }, { title: app.name }]}
        extra={
          app.hasAccess ? (
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => {
                if (app.url) {
                  window.open(app.url, '_blank')
                }
              }}
            >
              Launch App
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<LockOutlined />}
              onClick={() => router.push('/billing/plans')}
            >
              Upgrade to Access
            </Button>
          )
        }
      />

      {/* App Details */}
      <Card>
        <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 24 }}>
          {app.icon || '📱'}
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">{app.name}</Descriptions.Item>
          <Descriptions.Item label="Description">{app.description}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={app.status === 'active' ? 'success' : 'default'}>
              {app.status?.toUpperCase() || 'ACTIVE'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Access">
            {app.hasAccess ? (
              <Tag color="success">Granted</Tag>
            ) : (
              <Tag color="error">Locked</Tag>
            )}
          </Descriptions.Item>
          {app.category && (
            <Descriptions.Item label="Category">{app.category}</Descriptions.Item>
          )}
          {app.version && (
            <Descriptions.Item label="Version">{app.version}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Features */}
      {app.features && app.features.length > 0 && (
        <Card title="Features">
          <ul>
            {app.features.map((feature, index) => (
              <li key={index} style={{ marginBottom: 8 }}>
                {feature}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Locked Message */}
      {app.isLocked && (
        <Card style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
          <h3>🔒 This app is locked</h3>
          <p>
            Upgrade to a Pro or Enterprise plan to access this app and many others.
          </p>
          <Button
            type="primary"
            onClick={() => router.push('/billing/plans')}
          >
            View Plans
          </Button>
        </Card>
      )}
    </Space>
  )
}
