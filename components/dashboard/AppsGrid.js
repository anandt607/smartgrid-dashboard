import { Row, Col, Input, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import AppCard from './AppCard'
import EmptyState from '@/components/shared/EmptyState'

/**
 * Apps grid component with search functionality
 * @param {Array} apps - Array of app objects
 * @param {Function} onLaunch - Callback when app is launched
 * @param {Function} onUpgrade - Callback when upgrade is clicked
 */
export default function AppsGrid({ apps = [], onLaunch, onUpgrade }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter apps based on search term
  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Search Bar */}
      <Input
        placeholder="Search apps..."
        prefix={<SearchOutlined />}
        size="large"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ maxWidth: 400 }}
      />

      {/* Apps Grid */}
      {filteredApps.length > 0 ? (
        <Row gutter={[24, 24]}>
          {filteredApps.map((app) => (
            <Col
              key={app.id}
              xs={24}
              sm={12}
              md={12}
              lg={8}
              xl={6}
            >
              <AppCard
                app={app}
                onLaunch={onLaunch}
                onUpgrade={onUpgrade}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState
          description={
            searchTerm
              ? `No apps found matching "${searchTerm}"`
              : 'No apps available'
          }
        />
      )}
    </Space>
  )
}
