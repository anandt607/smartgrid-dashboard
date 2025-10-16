'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Divider, 
  Card,
  Typography,
  message,
  Row,
  Col
} from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  CrownOutlined,
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

// Default available apps - moved outside component to prevent recreation
const DEFAULT_AVAILABLE_APPS = [
  { name: 'teamgrid', label: 'TeamGrid', description: 'Team productivity tracking', icon: '👥' },
  { name: 'brandgrid', label: 'BrandGrid', description: 'Brand asset management', icon: '🎨' },
  { name: 'callgrid', label: 'CallGrid', description: 'Call center analytics', icon: '📞' },
  { name: 'salesgrid', label: 'SalesGrid', description: 'Sales performance tracking', icon: '📊' }
]

/**
 * Modal for editing team member details and app access
 */
export default function EditMemberModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  member,
  organizationId,
  availableApps = DEFAULT_AVAILABLE_APPS
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [appAccess, setAppAccess] = useState({})

  // Initialize form when member changes
  useEffect(() => {
    if (member && visible) {
      form.setFieldsValue({
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        role: member.role
      })
      
      // Initialize app access state
      const initialAccess = {}
      availableApps.forEach(app => {
        // If member has specific app access record, use it; otherwise default to true (inherits org access)
        initialAccess[app.name] = member.app_access?.[app.name] !== undefined ? member.app_access[app.name] : true
      })
      setAppAccess(initialAccess)
      console.log('🔍 Member app access data:', member.app_access)
      console.log('🔍 Initialized app access:', initialAccess)
    }
    
    // Cleanup function to reset state when modal closes
    return () => {
      if (!visible) {
        setAppAccess({})
        form.resetFields()
      }
    }
  }, [member, visible, form, availableApps])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Update member basic info
      const updateResponse = await fetch('/api/organization/members/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: member.id,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role
        })
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || 'Failed to update member')
      }

      // Update app access
      const appAccessResponse = await fetch('/api/organization/members/app-access', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: member.id,
          organizationId,
          appAccess
        })
      })

      if (!appAccessResponse.ok) {
        const errorData = await appAccessResponse.json()
        throw new Error(errorData.error || 'Failed to update app access')
      }

      message.success(`${values.firstName} ${values.lastName} has been updated successfully!`)
      form.resetFields()
      onSuccess?.()
      onCancel()

    } catch (error) {
      console.error('Error updating member:', error)
      message.error(error.message || 'Failed to update member')
    } finally {
      setLoading(false)
    }
  }

  const handleAppAccessChange = useCallback((appName, checked) => {
    setAppAccess(prev => ({
      ...prev,
      [appName]: checked
    }))
  }, [])

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <CrownOutlined style={{ color: '#faad14' }} />
      case 'admin':
        return <SafetyOutlined style={{ color: '#1890ff' }} />
      default:
        return <TeamOutlined style={{ color: '#52c41a' }} />
    }
  }

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Edit Team Member</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          role: 'member'
        }}
      >
        {/* Basic Information */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>
            <UserOutlined style={{ marginRight: 8 }} />
            Basic Information
          </Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="Enter email address" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select role">
                  <Option value="member">
                    <Space>
                      {getRoleIcon('member')}
                      Member
                    </Space>
                  </Option>
                  <Option value="admin">
                    <Space>
                      {getRoleIcon('admin')}
                      Admin
                    </Space>
                  </Option>
                  {member?.role === 'owner' && (
                    <Option value="owner" disabled>
                      <Space>
                        {getRoleIcon('owner')}
                        Owner
                      </Space>
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* App Access */}
        <Card size="small">
          <Title level={5}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            App Access
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Control which applications this member can access. Removing access will prevent them from logging into that app.
          </Text>

          <Space direction="vertical" style={{ width: '100%' }}>
            {availableApps.map(app => (
              <Card 
                key={app.name}
                size="small" 
                style={{ 
                  border: appAccess[app.name] ? '1px solid #52c41a' : '1px solid #d9d9d9',
                  backgroundColor: appAccess[app.name] ? '#f6ffed' : '#fafafa'
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <span style={{ fontSize: '20px' }}>{app.icon}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{app.label}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {app.description}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Switch
                      checked={appAccess[app.name] || false}
                      onChange={(checked) => handleAppAccessChange(app.name, checked)}
                      checkedChildren="Access"
                      unCheckedChildren="No Access"
                    />
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Card>

        <Divider />

        {/* Actions */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            Update Member
          </Button>
        </Space>
      </Form>
    </Modal>
  )
}
