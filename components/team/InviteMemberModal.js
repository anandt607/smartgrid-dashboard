import { useState } from 'react'
import { Modal, Form, Input, Select, Checkbox, Button, Space, message, Divider, Switch } from 'antd'
import { UserOutlined, MailOutlined, TeamOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons'
import { createTeamGridUser } from '@/lib/api/teamgrid'

/**
 * Modal for inviting new team members
 * @param {boolean} visible - Whether modal is visible
 * @param {Function} onCancel - Cancel handler
 * @param {Function} onSuccess - Success handler
 * @param {string} organizationId - Organization ID
 * @param {Array} availableApps - Available apps for access
 */
export default function InviteMemberModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  organizationId,
  availableApps = [
    { name: 'teamgrid', label: 'TeamGrid', description: 'Team productivity tracking' },
    { name: 'brandgrid', label: 'BrandGrid', description: 'Brand asset management' },
    { name: 'callgrid', label: 'CallGrid', description: 'Call center analytics' },
    { name: 'salesgrid', label: 'SalesGrid', description: 'Sales performance tracking' }
  ]
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Step 1: Create user in Supabase (generic data)
      message.loading('Creating user...', 0)
      
      const supabaseResponse = await fetch('/api/organization/members/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          organizationId,
          role: values.role,
          apps: values.apps || ['teamgrid']
        })
      })

      const supabaseData = await supabaseResponse.json()

      if (!supabaseResponse.ok) {
        throw new Error(supabaseData.error || 'Failed to create user')
      }

      const newUserId = supabaseData.userId

      // Step 2: Create TeamGrid-specific data in MongoDB (only if TeamGrid access selected)
      if (values.apps?.includes('teamgrid')) {
        message.loading('Adding TeamGrid data...', 0)
        
        await createTeamGridUser({
          supabase_user_id: newUserId,
          supabase_org_id: organizationId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.teamgrid_role || 'org_user',
          position: values.position || '',
          phone: values.phone || '',
          department: values.department || '',
          reportingManager: values.reportingManager || null,
          reportingManagers: values.reportingManagers || [],
          billingEnabled: values.billingEnabled !== false,
          permissions: {
            addProject: false,
            addTeamMember: false,
            viewReports: true,
            viewActivity: true,
            editProfile: true
          }
        })
      }

      message.destroy()
      
      // Show password to admin if it was generated
      if (supabaseData.password) {
        message.success({
          content: (
            <div>
              <div>{values.firstName} has been added successfully!</div>
              <div style={{ marginTop: 8, padding: 8, background: '#f0f0f0', borderRadius: 4, fontFamily: 'monospace' }}>
                <strong>Login Credentials:</strong><br/>
                Email: {values.email}<br/>
                Password: {supabaseData.password}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                Please share these credentials with the user.
              </div>
            </div>
          ),
          duration: 10
        })
      } else {
        message.success(`${values.firstName} has been added successfully!`)
      }
      
      form.resetFields()
      onSuccess?.()
      onCancel()

    } catch (error) {
      message.destroy()
      console.error('Error adding member:', error)
      message.error(error.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          Add Team Member
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          role: 'member',
          apps: ['teamgrid']
        }}
      >
        <Form.Item
          name="firstName"
          label={<span style={{ fontWeight: 500 }}>First Name</span>}
          rules={[
            { required: true, message: 'Please enter first name' },
            { min: 2, max: 50, message: 'First name must be 2-50 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="John"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={<span style={{ fontWeight: 500 }}>Last Name</span>}
          rules={[
            { required: true, message: 'Please enter last name' },
            { min: 1, max: 50, message: 'Last name must be 1-50 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Doe"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Email Address</span>}
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="john@company.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={<span style={{ fontWeight: 500 }}>Organization Role</span>}
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select 
            size="large" 
            placeholder="Select role"
            optionLabelProp="label"
          >
            <Select.Option value="member" label="Member">
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                  Member
                </div>
                <div style={{ fontSize: '12px', opacity: 0.65, lineHeight: 1.4 }}>
                  Can access assigned apps and view organization data
                </div>
              </div>
            </Select.Option>
            <Select.Option value="admin" label="Admin">
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                  Admin
                </div>
                <div style={{ fontSize: '12px', opacity: 0.65, lineHeight: 1.4 }}>
                  Can manage members and organization settings
                </div>
              </div>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="apps"
          label={<span style={{ fontWeight: 500 }}>App Access</span>}
          rules={[{ required: true, message: 'Please select at least one app' }]}
        >
          <Checkbox.Group>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {availableApps.map(app => (
                <Checkbox key={app.name} value={app.name}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{app.label}</div>
                    <div style={{ fontSize: '12px', opacity: 0.65, lineHeight: 1.4 }}>
                      {app.description}
                    </div>
                  </div>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>

        {/* <Form.Item noStyle shouldUpdate={(prev, curr) => prev.apps !== curr.apps}>
          {({ getFieldValue }) => {
            const selectedApps = getFieldValue('apps') || []
            const showTeamGridFields = selectedApps.includes('teamgrid')

            if (!showTeamGridFields) return null

            return (
              <>
                <Divider orientation="left">TeamGrid Details (Optional)</Divider>

                <Form.Item
                  name="position"
                  label="Position/Title"
                >
                  <Input
                    prefix={<BankOutlined />}
                    placeholder="CEO, Manager, Developer, etc."
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+1 234 567 8900"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="department"
                  label="Department"
                >
                  <Input
                    prefix={<BankOutlined />}
                    placeholder="Engineering, Sales, Marketing, etc."
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="teamgrid_role"
                  label="TeamGrid Role"
                  initialValue="org_user"
                >
                  <Select size="large">
                    <Select.Option value="org_user">
                      <div>
                        <div style={{ fontWeight: 500 }}>Team Member</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Regular team member with standard permissions
                        </div>
                      </div>
                    </Select.Option>
                    <Select.Option value="manager">
                      <div>
                        <div style={{ fontWeight: 500 }}>Manager</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Can manage projects and view team reports
                        </div>
                      </div>
                    </Select.Option>
                    <Select.Option value="org_admin">
                      <div>
                        <div style={{ fontWeight: 500 }}>Organization Admin</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Full access to organization settings
                        </div>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="billingEnabled"
                  label="Billing Enabled"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                  <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: '12px' }}>
                    Track time and bill for this member's work
                  </span>
                </Form.Item>
              </>
            )
          }}
        </Form.Item> */}

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
            >
              Add Member
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
