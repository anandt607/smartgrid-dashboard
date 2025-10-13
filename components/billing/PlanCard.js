import { Card, Button, List, Typography, Space, Tag } from 'antd'
import { CheckOutlined, CrownOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * Plan card component
 * Displays a subscription plan with features and pricing
 * @param {Object} plan - Plan object from API
 * @param {boolean} currentPlan - Whether this is the user's current plan
 * @param {Function} onSelect - Callback when plan is selected
 * @param {boolean} loading - Loading state
 * @param {boolean} recommended - Mark as recommended plan
 */
export default function PlanCard({ 
  plan, 
  currentPlan = false, 
  onSelect, 
  loading = false,
  recommended = false 
}) {
  if (!plan) return null

  return (
    <Card
      className={`plan-card ${recommended ? 'plan-card-recommended' : ''}`}
      hoverable={!currentPlan}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Plan Header */}
        <div style={{ textAlign: 'center' }}>
          {plan.name?.includes('Enterprise') && (
            <CrownOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
          )}
          <Title level={3} style={{ margin: 0 }}>
            {plan.name}
          </Title>
          <div style={{ marginTop: 16 }}>
            <Title level={2} style={{ margin: 0, display: 'inline' }}>
              {plan.priceDisplay}
            </Title>
            <Text type="secondary">{plan.price > 0 ? ' / month' : ' forever'}</Text>
          </div>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            {plan.credits} credits/month
          </Text>
        </div>

        {/* Features List */}
        <List
          dataSource={plan.features || []}
          renderItem={(feature) => (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <Space>
                <CheckOutlined style={{ color: '#52c41a' }} />
                <Text>{feature}</Text>
              </Space>
            </List.Item>
          )}
        />

        {/* Action Button */}
        {currentPlan ? (
          <Tag color="success" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
            Current Plan
          </Tag>
        ) : (
          <Button
            type={recommended ? 'primary' : 'default'}
            size="large"
            block
            onClick={() => onSelect && onSelect(plan)}
            loading={loading}
          >
            {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
          </Button>
        )}
      </Space>
    </Card>
  )
}
