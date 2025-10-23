'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message, Space, Progress } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, ArrowRightOutlined, CheckCircleOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  // Prevent body scroll
  useEffect(() => {
    document.body.classList.add('auth-page-active')
    return () => {
      document.body.classList.remove('auth-page-active')
    }
  }, [])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        organizationName: values.organizationName,
      })
      
      // Clear all cached queries
      queryClient.clear()
      
      message.success(response.message || `Welcome to ${response.organization?.name}! 🎉`)
      router.push('/login')
    } catch (error) {
      message.error(error?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '0',
      overflow: 'hidden'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 450,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #303030',
          background: '#141414',
          margin: '20px'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: '0 0 8px', color: '#ffffff', fontWeight: 600 }}>Create Your Organization</Title>
          <Text style={{ fontSize: 16, color: '#bfbfbf' }}>
            Start your 14-day free trial with SmartGrid
          </Text>
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
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="Enter your full name"
              style={{ 
                height: '44px',
                borderRadius: '6px',
                border: '1px solid #434343',
                background: '#262626',
                color: '#ffffff'
              }}
            />
          </Form.Item>

          <Form.Item
            name="organizationName"
            rules={[{ required: true, message: 'Please enter your organization name' }]}
          >
            <Input
              prefix={<BankOutlined style={{ color: '#1890ff' }} />}
              placeholder="Enter your organization name"
              style={{ 
                height: '44px',
                borderRadius: '6px',
                border: '1px solid #434343',
                background: '#262626',
                color: '#ffffff'
              }}
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
              prefix={<MailOutlined style={{ color: '#1890ff' }} />}
              placeholder="Enter your email address"
              style={{ 
                height: '44px',
                borderRadius: '6px',
                border: '1px solid #434343',
                background: '#262626',
                color: '#ffffff'
              }}
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
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Create a strong password"
              style={{ 
                height: '44px',
                borderRadius: '6px',
                border: '1px solid #434343',
                background: '#262626',
                color: '#ffffff'
              }}
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
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Confirm your password"
              style={{ 
                height: '44px',
                borderRadius: '6px',
                border: '1px solid #434343',
                background: '#262626',
                color: '#ffffff'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{
                height: '44px',
                borderRadius: '6px',
                background: '#1890ff',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 13, lineHeight: 1.5, color: '#bfbfbf' }}>
              By signing up, you agree to our{' '}
              <Link href="#" style={{ color: '#1890ff' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" style={{ color: '#1890ff' }}>Privacy Policy</Link>
            </Text>
          </div>

          <Divider style={{ margin: '24px 0', borderColor: '#434343' }}>
            <Text style={{ fontSize: 14, color: '#bfbfbf' }}>or</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: 15, color: '#bfbfbf' }}>
              Already have an account?{' '}
              <Link 
                href="/login" 
                style={{ 
                  color: '#1890ff', 
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}
