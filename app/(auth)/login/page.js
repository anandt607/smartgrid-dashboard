'use client'

import { useState } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/api/auth'

const { Text, Title } = Typography

/**
 * Login page
 * Allows users to sign in with email and password
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await signIn({
        email: values.email,
        password: values.password,
      })
      message.success('Login successful!')
      router.push('/')
    } catch (error) {
      message.error(error?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>Welcome Back</Title>
        <Text type="secondary">Sign in to your account to continue</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email address"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/forgot-password" style={{ color: '#1890ff' }}>
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form.Item>

        <Divider>or</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#1890ff', fontWeight: 500 }}>
              Sign up
            </Link>
          </Text>
        </div>
      </Form>
    </Card>
  )
}
