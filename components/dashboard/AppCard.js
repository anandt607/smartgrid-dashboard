import { Card, Button, Tag, Space, Typography } from 'antd'
import { LockOutlined, RocketOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

/**
 * App card component
 * Displays an app with icon, name, description, and action button
 * @param {Object} app - App object
 * @param {Function} onLaunch - Callback when launch button is clicked
 * @param {Function} onUpgrade - Callback when upgrade button is clicked
 */
export default function AppCard({ app, onLaunch, onUpgrade }) {
  const { name, description, icon, hasAccess, isLocked, status } = app

  return (
    <Card
      className={`app-card ${isLocked ? 'app-card-locked' : ''}`}
      hoverable={!isLocked}
      onClick={() => hasAccess && onLaunch && onLaunch(app)}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* App Icon */}
        <div style={{ fontSize: 48, textAlign: 'center' }}>
          {icon || '📱'}
        </div>

        {/* App Name */}
        <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
          {name}
        </Title>

        {/* App Description */}
        <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
          {description}
        </Text>

        {/* Status Tag */}
        {status && (
          <div style={{ textAlign: 'center' }}>
            <Tag color={status === 'active' ? 'success' : 'default'}>
              {status}
            </Tag>
          </div>
        )}

        {/* Action Button */}
        <div onClick={(e) => e.stopPropagation()}>
          {isLocked ? (
            <Button
              type="primary"
              icon={<LockOutlined />}
              block
              onClick={() => onUpgrade && onUpgrade(app)}
            >
              Upgrade to Access
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<RocketOutlined />}
              block
              onClick={() => onLaunch && onLaunch(app)}
            >
              Launch
            </Button>
          )}
        </div>
      </Space>
    </Card>
  )
}
