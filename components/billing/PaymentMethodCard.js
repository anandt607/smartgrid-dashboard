import { Card, Empty, Space, Tag, Button } from 'antd'
import { CreditCardOutlined, PlusOutlined } from '@ant-design/icons'

/**
 * Payment method card component
 * Displays saved payment methods
 * @param {Array} paymentMethods - Array of payment method objects
 * @param {Function} onAdd - Callback to add new payment method
 * @param {boolean} loading - Loading state
 */
export default function PaymentMethodCard({ paymentMethods = [], onAdd, loading = false }) {
  return (
    <Card
      title="Payment Methods"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          loading={loading}
        >
          Add Method
        </Button>
      }
    >
      {paymentMethods.length > 0 ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              size="small"
              style={{ backgroundColor: '#fafafa' }}
            >
              <Space>
                <CreditCardOutlined style={{ fontSize: 24 }} />
                <div>
                  <div>
                    <strong>{method.brand?.toUpperCase()}</strong> ending in{' '}
                    <strong>{method.last4}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    Expires {method.exp_month}/{method.exp_year}
                  </div>
                </div>
                {method.isDefault && (
                  <Tag color="blue">Default</Tag>
                )}
              </Space>
            </Card>
          ))}
        </Space>
      ) : (
        <Empty
          description="No payment methods saved"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  )
}
