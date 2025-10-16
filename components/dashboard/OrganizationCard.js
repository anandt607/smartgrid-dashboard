'use client'

import { Card, Space, Typography, Tag, Statistic, Row, Col } from 'antd'
import { 
  BankOutlined, 
  TeamOutlined, 
  ClockCircleOutlined,
  CrownOutlined 
} from '@ant-design/icons'
import { getPlanColor } from '@/lib/utils/helpers'

const { Title, Text } = Typography

/**
 * Organization overview card
 * Shows organization name, plan, members, and trial status
 * @param {Object} organization - Organization data with billing info
 * @param {boolean} loading - Loading state
 */
export default function OrganizationCard({ organization, loading }) {
  if (!organization) return null

  const billing = organization.billing
  const isOnTrial = billing?.status === 'trial'
  const daysLeft = billing?.trial_ends_at 
    ? Math.ceil((new Date(billing.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card 
      loading={loading}
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 12
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Organization Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BankOutlined style={{ fontSize: 32, color: 'white' }} />
          <div>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {organization.name}
            </Title>
            <Space size={8}>
              <Tag color={getPlanColor(billing?.plan)} style={{ marginTop: 8 }}>
                {billing?.plan?.toUpperCase() || 'FREE'} PLAN
              </Tag>
              {organization.role === 'owner' && (
                <Tag color="gold" icon={<CrownOutlined />}>
                  OWNER
                </Tag>
              )}
            </Space>
          </div>
        </div>

        {/* Stats */}
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: 16, 
              borderRadius: 8 
            }}>
              <Space direction="vertical" size={2}>
                <TeamOutlined style={{ fontSize: 24, color: 'white' }} />
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                  Team Members
                </Text>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {billing?.current_members || 0} / {billing?.max_members || 5}
                </Title>
              </Space>
            </div>
          </Col>

          {isOnTrial && (
            <Col span={12}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: 16, 
                borderRadius: 8 
              }}>
                <Space direction="vertical" size={2}>
                  <ClockCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                    Trial Ends In
                  </Text>
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                  </Title>
                </Space>
              </div>
            </Col>
          )}
        </Row>

        {/* Trial Warning */}
        {isOnTrial && daysLeft <= 3 && daysLeft > 0 && (
          <div style={{ 
            background: 'rgba(250, 173, 20, 0.2)', 
            padding: 12, 
            borderRadius: 6,
            border: '1px solid rgba(250, 173, 20, 0.5)'
          }}>
            <Text style={{ color: 'white', fontSize: 13 }}>
              ⚠️ Your trial ends in {daysLeft} days. Upgrade to continue using all features.
            </Text>
          </div>
        )}
      </Space>
    </Card>
  )
}

