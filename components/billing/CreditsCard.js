import { Card, Progress, Typography, Space, Button } from 'antd'
import { ThunderboltOutlined, PlusOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

/**
 * Credits card component
 * Shows available credits with progress bar
 * @param {Object} billing - Billing info with credits data
 * @param {boolean} loading - Loading state
 */
export default function CreditsCard({ billing, loading = false }) {
  const router = useRouter()
  
  const totalCredits = billing?.total_credits || 100
  const usedCredits = billing?.used_credits || 0
  const availableCredits = billing?.credits || 100
  const usagePercent = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0
  
  const getProgressColor = () => {
    if (usagePercent < 50) return '#52c41a'
    if (usagePercent < 80) return '#faad14'
    return '#ff4d4f'
  }

  return (
    <Card loading={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Text type="secondary">Available Credits</Text>
            <Title level={2} style={{ margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThunderboltOutlined style={{ color: '#faad14', fontSize: 32 }} />
              {availableCredits.toLocaleString()}
            </Title>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => router.push('/billing/plans')}
          >
            Add Credits
          </Button>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text type="secondary">Used: {usedCredits.toLocaleString()}</Text>
            <Text type="secondary">Total: {totalCredits.toLocaleString()}</Text>
          </div>
          <Progress 
            percent={usagePercent} 
            strokeColor={getProgressColor()}
            status="normal"
            showInfo={true}
          />
        </div>

        {/* Usage Info */}
        <div style={{ 
          padding: 16, 
          background: 'var(--card)', 
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 16 }}>
              Credit Usage This Month
            </Text>
            <Text type="secondary">
              You&apos;ve used {usedCredits.toLocaleString()} out of {totalCredits.toLocaleString()} credits
            </Text>
            {usagePercent >= 80 && (
              <Text type="warning" style={{ marginTop: 8 }}>
                ⚠️ You&apos;re running low on credits. Consider upgrading your plan.
              </Text>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

