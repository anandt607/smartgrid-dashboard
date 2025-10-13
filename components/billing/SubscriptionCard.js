import { Card, Descriptions, Button, Space, Tag } from 'antd'
import { CreditCardOutlined, StopOutlined } from '@ant-design/icons'
import { formatDate, formatCurrency, getPlanColor, getStatusColor } from '@/lib/utils/helpers'
import { PLAN_DETAILS } from '@/lib/utils/constants'

/**
 * Subscription card component
 * Displays current subscription details
 * @param {Object} billing - Billing information
 * @param {Function} onManage - Callback to manage subscription
 * @param {Function} onCancel - Callback to cancel subscription
 * @param {boolean} loading - Loading state
 */
export default function SubscriptionCard({ billing, onManage, onCancel, loading = false }) {
  if (!billing) return null

  const planInfo = PLAN_DETAILS[billing.plan]
  const isFree = billing.plan === 'free'

  return (
    <Card
      title="Current Subscription"
      extra={
        !isFree && (
          <Space>
            <Button
              icon={<CreditCardOutlined />}
              onClick={onManage}
              loading={loading}
            >
              Manage Billing
            </Button>
            {billing.status === 'active' && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={onCancel}
                loading={loading}
              >
                Cancel
              </Button>
            )}
          </Space>
        )
      }
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Plan">
          <Tag color={getPlanColor(billing.plan)}>
            {planInfo?.name || billing.plan}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(billing.status)}>
            {billing.status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Credits">
          {billing.credits?.toLocaleString() || 0}
        </Descriptions.Item>
        
        {!isFree && (
          <>
            <Descriptions.Item label="Monthly Price">
              {formatCurrency(planInfo?.price || 0)}
            </Descriptions.Item>
            
            {billing.current_period_end && (
              <Descriptions.Item label="Next Billing Date">
                {formatDate(billing.current_period_end)}
              </Descriptions.Item>
            )}
            
            {billing.cancel_at && (
              <Descriptions.Item label="Cancels On">
                <span style={{ color: '#ff4d4f' }}>
                  {formatDate(billing.cancel_at)}
                </span>
              </Descriptions.Item>
            )}
          </>
        )}
        
        {billing.created_at && (
          <Descriptions.Item label="Member Since">
            {formatDate(billing.created_at)}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}
