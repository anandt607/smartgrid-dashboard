import { Card, Skeleton, Row, Col } from 'antd'

/**
 * Skeleton loading component for Organization data
 * Shows skeleton placeholders while organization data is loading
 */
export default function OrganizationSkeleton() {
  return (
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
  )
}
