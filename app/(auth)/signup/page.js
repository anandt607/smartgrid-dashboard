'use client'

import { useState } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/api/auth'
import { validatePasswordStrength } from '@/lib/utils/helpers'

const { Text, Title } = Typography

/**
 * Signup page
 * Allows new users to create an account
 */
export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      })
      message.success('Account created successfully! Please check your email to verify your account.')
      router.push('/login')
    } catch (error) {
      message.error(error?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>Create Account</Title>
        <Text type="secondary">Sign up to get started with SmartGrid</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="fullName"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Full name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email address"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const strength = validatePasswordStrength(value)
                if (strength.isValid) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Password must contain uppercase, lowercase, and numbers'))
              },
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password (min 8 characters)"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Account
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </div>

        <Divider>or</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#1890ff', fontWeight: 500 }}>
              Sign in
            </Link>
          </Text>
        </div>
      </Form>
    </Card>
  )
}
