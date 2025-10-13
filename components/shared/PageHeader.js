import { Breadcrumb, Space, Typography } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * Page header component with title, subtitle, and breadcrumb
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle/description
 * @param {Array} breadcrumb - Breadcrumb items array
 * @param {ReactNode} extra - Extra content to display on the right
 */
export default function PageHeader({ title, subtitle, breadcrumb, extra }) {
  return (
    <div className="page-header">
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            {
              href: '/',
              title: <HomeOutlined />,
            },
            ...breadcrumb,
          ]}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" className="subtitle">
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <Space>{extra}</Space>}
      </div>
    </div>
  )
}
