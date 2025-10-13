import { Form, Input, Button, Card, Space, Alert } from 'antd'
import { LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { validatePasswordStrength } from '@/lib/utils/helpers'
import { useState } from 'react'

/**
 * Security settings component
 * Form for changing password and security settings
 * @param {Function} onPasswordChange - Password change handler
 * @param {boolean} loading - Loading state
 */
export default function SecuritySettings({ onPasswordChange, loading = false }) {
  const [form] = Form.useForm()
  const [passwordStrength, setPasswordStrength] = useState(null)

  const handlePasswordChange = (e) => {
    const password = e.target.value
    if (password) {
      const strength = validatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }

  const handleSubmit = (values) => {
    onPasswordChange && onPasswordChange(values.newPassword)
    form.resetFields()
    setPasswordStrength(null)
  }

  return (
    <Card title={<><SafetyOutlined /> Security Settings</>}>
      <Alert
        message="Password Requirements"
        description="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter a new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) return Promise.resolve()
                const strength = validatePasswordStrength(value)
                if (strength.isValid) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Password does not meet requirements'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
            size="large"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {passwordStrength && (
          <div style={{ marginTop: -16, marginBottom: 16 }}>
            <Space size={4}>
              <span style={{ color: passwordStrength.minLength ? '#52c41a' : '#ff4d4f' }}>
                {passwordStrength.minLength ? '✓' : '✗'} 8+ chars
              </span>
              <span style={{ color: passwordStrength.hasUpperCase ? '#52c41a' : '#ff4d4f' }}>
                {passwordStrength.hasUpperCase ? '✓' : '✗'} Uppercase
              </span>
              <span style={{ color: passwordStrength.hasLowerCase ? '#52c41a' : '#ff4d4f' }}>
                {passwordStrength.hasLowerCase ? '✓' : '✗'} Lowercase
              </span>
              <span style={{ color: passwordStrength.hasNumbers ? '#52c41a' : '#ff4d4f' }}>
                {passwordStrength.hasNumbers ? '✓' : '✗'} Numbers
              </span>
            </Space>
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
