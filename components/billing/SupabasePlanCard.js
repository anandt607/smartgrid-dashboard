import { Card, Button, List, Typography, Space, Tag, Badge } from 'antd'
import { CheckOutlined, CrownOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

export default function SupabasePlanCard({ 
  plan, 
  currentPlan = false, 
  onSelect, 
  loading = false,
  recommended = false,
  index = 0
}) {
  if (!plan) return null

  const icons = {
    0: null,
    1: <RocketOutlined style={{ fontSize: 32 }} />,
    2: <CrownOutlined style={{ fontSize: 32 }} />
  }

  const colors = {
    0: '#6b7280',
    1: '#10b981',
    2: '#8b5cf6'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      style={{ height: '100%' }}
    >
      <Card
        className={`plan-card ${recommended ? 'plan-card-recommended' : ''}`}
        hoverable={!currentPlan}
        style={{
          height: '100%',
          background: recommended ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
          borderWidth: recommended ? 2 : 1,
        }}
        bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {recommended && (
          <Badge.Ribbon text="MOST POPULAR" color="#10b981">
            <div style={{ padding: 0 }} />
          </Badge.Ribbon>
        )}
        
        <div style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Plan Header */}
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ color: colors[index], marginBottom: 16 }}
            >
              {icons[index]}
            </motion.div>
            
            <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              {plan.name}
            </Title>
            
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {plan.description}
            </Text>
            
            <div style={{ marginTop: 24 }}>
              <Title 
                level={1} 
                style={{ 
                  margin: 0, 
                  display: 'inline',
                  background: `linear-gradient(135deg, ${colors[index]} 0%, ${colors[index === 2 ? 1 : index + 1]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700
                }}
              >
                {plan.priceDisplay}
              </Title>
              <Text type="secondary" style={{ fontSize: 18 }}>
                {plan.price > 0 ? ' / month' : ' forever'}
              </Text>
            </div>
            
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ 
                marginTop: 16, 
                padding: '8px 16px',
                background: `linear-gradient(135deg, ${colors[index]}20 0%, ${colors[index]}10 100%)`,
                borderRadius: 20,
                display: 'inline-block'
              }}
            >
              <ThunderboltOutlined style={{ color: colors[index], marginRight: 8 }} />
              <Text strong style={{ color: colors[index] }}>
                {plan.credits} credits/month
              </Text>
            </motion.div>
          </div>

          {/* Features List */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <List
              dataSource={plan.features || []}
              renderItem={(feature, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                >
                  <List.Item style={{ border: 'none', padding: '8px 0' }}>
                    <Space>
                      <CheckOutlined style={{ color: '#10b981', fontSize: 16 }} />
                      <Text style={{ fontSize: 14 }}>{feature}</Text>
                    </Space>
                  </List.Item>
                </motion.div>
              )}
            />
          </div>

          {/* Action Button - Always at bottom */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentPlan ? (
              <Tag 
                color="success" 
                style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  padding: '12px 0',
                  fontSize: 16,
                  fontWeight: 500,
                  border: 'none'
                }}
              >
                ✓ Current Plan
              </Tag>
            ) : (
              <Button
                type={recommended ? 'primary' : 'default'}
                size="large"
                block
                onClick={() => onSelect && onSelect(plan)}
                loading={loading}
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  background: recommended ? 
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                    plan.price === 0 ? 
                    'rgba(107, 114, 128, 0.1)' :
                    index === 2 ?
                    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' :
                    undefined,
                  borderColor: plan.price === 0 ? '#6b7280' : undefined,
                  color: plan.price === 0 ? '#6b7280' : 
                         index === 2 ? '#ffffff' : undefined,
                  border: (recommended || index === 2) ? 'none' : undefined,
                }}
              >
                {plan.price === 0 ? 'Get Started Free' : `Upgrade to ${plan.name.split(' ')[1]}`}
              </Button>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
