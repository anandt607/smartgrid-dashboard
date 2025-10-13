import { Form, Input, Button, Space } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons'

/**
 * Profile form component
 * Form for editing user profile information
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Form submit handler
 * @param {boolean} loading - Loading state
 */
export default function ProfileForm({ initialValues, onSubmit, loading = false }) {
  const [form] = Form.useForm()

  const handleSubmit = (values) => {
    onSubmit && onSubmit(values)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item
        name="full_name"
        label="Full Name"
        rules={[{ required: true, message: 'Please enter your full name' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="John Doe"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="john@example.com"
          size="large"
          disabled // Email cannot be changed
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[
          { 
            pattern: /^[\d\s\-\+\(\)]+$/, 
            message: 'Please enter a valid phone number' 
          },
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="+1 (555) 123-4567"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="company"
        label="Company"
      >
        <Input
          prefix={<BankOutlined />}
          placeholder="Acme Inc."
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Save Changes
          </Button>
          <Button size="large" onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
