import { Row, Col } from 'antd'
import { 
  AppstoreOutlined, 
  TeamOutlined, 
  ThunderboltOutlined, 
  DollarOutlined 
} from '@ant-design/icons'
import StatCard from '@/components/shared/StatCard'

/**
 * Quick stats component
 * Displays key metrics in a row of stat cards
 * @param {Object} stats - Stats object with metrics
 * @param {boolean} loading - Loading state
 */
export default function QuickStats({ stats = {}, loading = false }) {
  const {
    totalApps = 0,
    activeUsers = 0,
    creditsUsed = 0,
    revenue = 0,
  } = stats

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={12} lg={8}>
        <StatCard
          title="Total Apps"
          value={totalApps}
          prefix={<AppstoreOutlined />}
          valueStyle={{ color: '#1890ff' }}
          loading={loading}
        />
      </Col>
      <Col xs={12} sm={12} lg={8}>
        <StatCard
          title="Active Apps"
          value={activeUsers}
          prefix={<TeamOutlined />}
          valueStyle={{ color: '#52c41a' }}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={24} lg={8}>
        <StatCard
          title="Credits Used"
          value={creditsUsed}
          prefix={<ThunderboltOutlined />}
          valueStyle={{ color: '#faad14' }}
          loading={loading}
        />
      </Col>
    </Row>
  )
}
