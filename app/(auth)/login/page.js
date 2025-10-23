'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message, Space, Spin } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
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
      console.log('User already logged in, redirecting to dashboard...')
      router.replace('/') // Use replace instead of push to avoid back button issues
    }
  }, [user, authLoading, router])

  // Prevent body scroll
  useEffect(() => {
    document.body.classList.add('auth-page-active')
    return () => {
      document.body.classList.remove('auth-page-active')
    }
  }, [])

  // Don't hide the form completely - just show loading state
  // The form will be rendered below with loading state

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
      router.replace('/') // Use replace instead of push
      
      // Refresh the page after navigation to ensure fresh data
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      // Show specific error message for member access
      if (error?.message?.includes('Only organization owners and admins can access SmartGrid Dashboard')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Access Restricted</div>
              <div>Only organization owners and admins can access SmartGrid Dashboard.</div>
              <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
                Members can access individual Grid applications:
              </div>
              <div style={{ marginTop: 4, fontSize: 14 }}>
                • TeamGrid (Team Management)
                <br/>• BrandGrid (Brand Management)  
                <br/>• CallGrid (Call Management)
                <br/>• SalesGrid (Sales Management)
              </div>
            </div>
          ),
          duration: 8
        })
      } else {
        message.error(error?.message || 'Invalid email or password')
      }
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
          maxWidth: 400,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #303030',
          background: '#141414',
          margin: '20px'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: '0 0 8px', color: '#ffffff', fontWeight: 600 }}>Welcome Back</Title>
          <Text style={{ fontSize: 16, color: '#bfbfbf' }}>
            {user ? 'Already logged in, redirecting...' : 
             'Sign in to your SmartGrid account'}
          </Text>
        </div>

        {authLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text style={{ color: '#bfbfbf' }}>Loading...</Text>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            disabled={!!user}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter your email"
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
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter your password"
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
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link 
                  href="/forgot-password" 
                  style={{ 
                    color: '#1890ff', 
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                >
                  Forgot password?
                </Link>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 24 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                disabled={!!user}
                style={{
                  height: '44px',
                  borderRadius: '6px',
                  background: '#1890ff',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {user ? 'Redirecting...' : loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>

            <Divider style={{ margin: '24px 0', borderColor: '#434343' }}>
              <Text style={{ fontSize: 14, color: '#bfbfbf' }}>or</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 15, color: '#bfbfbf' }}>
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  style={{ 
                    color: '#1890ff', 
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  Create Account
                </Link>
              </Text>
            </div>
          </Form>
        )}
      </Card>
    </div>
  )
}
