'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Divider, Typography, message, Space, Spin } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { signIn } from '@/lib/api/auth'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase/client'

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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
             options: {
               redirectTo: `${window.location.origin}/auth/callback`
             }
      })
      
      if (error) {
        console.error('Google login error:', error)
        message.error('Google login failed')
      } else {
        // Show loading message for Google OAuth
        message.loading('Redirecting to Google...', 2)
      }
    } catch (error) {
      console.error('Google login error:', error)
      message.error('Google login failed')
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

            <Form.Item style={{ marginBottom: 16 }}>
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

            <Divider style={{ margin: '16px 0', borderColor: '#434343' }}>
              <Text style={{ fontSize: 14, color: '#bfbfbf' }}>or</Text>
            </Divider>

            <Form.Item style={{ marginBottom: 24 }}>
        <Button 
          onClick={handleGoogleLogin}
          size="large"
          block
          loading={loading}
          disabled={!!user}
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
            {user ? 'Redirecting...' : loading ? 'Signing In...' : 'Continue with Google'}
          </div>
        </Button>
            </Form.Item>

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
