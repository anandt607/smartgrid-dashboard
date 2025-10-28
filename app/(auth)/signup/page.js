'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message, Space, Progress } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, ArrowRightOutlined, CheckCircleOutlined, EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { signUp } from '@/lib/api/auth'
import { validatePasswordStrength } from '@/lib/utils/helpers'
import { supabase } from '@/lib/supabase/client'

const { Text, Title } = Typography

/**
 * Signup page
 * Allows new users to create an account
 */
export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Google signup error:', error)
        message.error('Google signup failed')
      } else {
        // Show loading message for Google OAuth
        message.loading('Redirecting to Google...', 2)
      }
    } catch (error) {
      console.error('Google signup error:', error)
      message.error('Google signup failed')
    } finally {
      setGoogleLoading(false)
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

          <Divider style={{ margin: '16px 0', borderColor: '#434343' }}>
            <Text style={{ fontSize: 14, color: '#bfbfbf' }}>or</Text>
          </Divider>

          <Form.Item style={{ marginBottom: 16 }}>
        <Button 
          onClick={handleGoogleSignup}
          size="large"
          block
          loading={googleLoading}
          style={{
            height: '44px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            color: '#3c4043',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            marginBottom: '16px'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'
            e.target.style.borderColor = '#c1c7cd'
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
            e.target.style.borderColor = '#dadce0'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </div>
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
