import { Card, Skeleton, Row, Col, Space } from 'antd'

/**
 * Skeleton loading component for Team page
 * Shows skeleton placeholders while data is loading
 */
export default function TeamPageSkeleton() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Page Header Skeleton */}
      <Card>
        <Skeleton.Input active size="large" style={{ width: 300, height: 40 }} />
        <Skeleton.Input active size="small" style={{ width: 200, height: 20, marginTop: 8 }} />
      </Card>

      {/* Team Statistics Skeleton */}
      <Card>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton.Input active size="large" style={{ width: '100%', height: 60 }} />
            <Skeleton.Input active size="small" style={{ width: 120, height: 16, marginTop: 8 }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton.Input active size="large" style={{ width: '100%', height: 60 }} />
            <Skeleton.Input active size="small" style={{ width: 100, height: 16, marginTop: 8 }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton.Input active size="large" style={{ width: '100%', height: 60 }} />
            <Skeleton.Input active size="small" style={{ width: 80, height: 16, marginTop: 8 }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton.Input active size="large" style={{ width: '100%', height: 60 }} />
            <Skeleton.Input active size="small" style={{ width: 90, height: 16, marginTop: 8 }} />
          </Col>
        </Row>
      </Card>

      {/* Members Table Skeleton */}
      <Card>
        <Skeleton.Input active size="default" style={{ width: 200, height: 24, marginBottom: 16 }} />
        
        {/* Table Header Skeleton */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
          <Col span={6}>
            <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
          </Col>
          <Col span={4}>
            <Skeleton.Input active size="small" style={{ width: 50, height: 16 }} />
          </Col>
          <Col span={4}>
            <Skeleton.Input active size="small" style={{ width: 70, height: 16 }} />
          </Col>
          <Col span={4}>
            <Skeleton.Input active size="small" style={{ width: 90, height: 16 }} />
          </Col>
          <Col span={4}>
            <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
          </Col>
          <Col span={2}>
            <Skeleton.Input active size="small" style={{ width: 40, height: 16 }} />
          </Col>
        </Row>

        {/* Table Rows Skeleton */}
        {[1, 2, 3, 4, 5].map((index) => (
          <Row key={index} gutter={[16, 16]} style={{ marginBottom: 12, padding: '12px 0' }}>
            <Col span={6}>
              <Space>
                <Skeleton.Avatar active size={40} />
                <div>
                  <Skeleton.Input active size="small" style={{ width: 120, height: 16, marginBottom: 4 }} />
                  <Skeleton.Input active size="small" style={{ width: 150, height: 12 }} />
                </div>
              </Space>
            </Col>
            <Col span={4}>
              <Skeleton.Input active size="small" style={{ width: 60, height: 20 }} />
            </Col>
            <Col span={4}>
              <Skeleton.Input active size="small" style={{ width: 80, height: 14 }} />
            </Col>
            <Col span={4}>
              <Skeleton.Input active size="small" style={{ width: 100, height: 14 }} />
            </Col>
            <Col span={4}>
              <Skeleton.Input active size="small" style={{ width: 70, height: 14 }} />
            </Col>
            <Col span={2}>
              <Skeleton.Button active size="small" style={{ width: 24, height: 24 }} />
            </Col>
          </Row>
        ))}
      </Card>
    </Space>
  )
}
