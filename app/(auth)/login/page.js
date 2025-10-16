'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { signIn } from '@/lib/api/auth'
import { useAuth } from '@/components/providers/AuthProvider'

const { Text, Title } = Typography

/**
 * Login page
 * Allows users to sign in with email and password
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Show loading while checking auth state
  if (authLoading) {
    return <div>Loading...</div>
  }

  // Don't render login form if user is already logged in
  if (user) {
    return <div>Redirecting...</div>
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await signIn({
        email: values.email,
        password: values.password,
      })
      
      // Clear all cached queries to fetch fresh data
      queryClient.clear()
      
      message.success('Login successful!')
      router.push('/')
      
      // Refresh the page after navigation to ensure fresh data
      setTimeout(() => {
        window.location.reload()
      }, 100)
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
