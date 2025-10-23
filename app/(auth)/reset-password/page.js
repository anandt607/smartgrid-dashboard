'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, Form, Input, Button, Typography, message, Alert, Space, Spin } from 'antd'
import { ArrowLeftOutlined, LockOutlined, CheckCircleOutlined, EyeInvisibleOutlined, EyeTwoTone, KeyOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Text, Title } = Typography

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()
  const searchParams = useSearchParams()
  const appId = searchParams.get('app') || 'smartgrid-dashboard'

  useEffect(() => {
    // Check if user has a valid session (came from email link)
    // In a real implementation, you'd verify the session token here
    setIsValidSession(true)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    document.body.classList.add('auth-page-active')
    return () => {
      document.body.classList.remove('auth-page-active')
    }
  }, [])

  const handleSubmit = async (values) => {
    setLoading(true)
    setError('')

    try {
      // Use Supabase client directly for password reset
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // Update password using Supabase
      const { data, error } = await supabase.auth.updateUser({
        password: values.password
      })

      if (error) {
        throw new Error(error.message || 'Failed to reset password')
      }

      // Sign out user after password reset to clear session
      await supabase.auth.signOut()
      
      setSuccess(true)
      message.success('Password reset successfully! Please login with your new password.')
    } catch (err) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isValidSession) {
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
            margin: '20px',
            textAlign: 'center'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px rgba(255, 77, 79, 0.3)'
          }}>
            <LockOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          
          <Title level={2} style={{ margin: '0 0 16px', color: '#ffffff' }}>Invalid Reset Link</Title>
          <Text style={{ display: 'block', marginBottom: 32, fontSize: 16, color: '#bfbfbf' }}>
            This password reset link is invalid or has expired.
          </Text>
          
          <Link
            href={`/forgot-password${appId !== 'smartgrid-dashboard' ? `?app=${appId}` : ''}`}
            style={{ 
              color: '#667eea', 
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 16
            }}
          >
            Request a new reset link
          </Link>
        </Card>
      </div>
    )
  }

  if (success) {
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
            margin: '20px',
            textAlign: 'center'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px rgba(82, 196, 26, 0.3)'
          }}>
            <CheckCircleOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          
          <Title level={2} style={{ margin: '0 0 16px', color: '#ffffff' }}>Password Reset Successful</Title>
          <Text style={{ display: 'block', marginBottom: 32, fontSize: 16, color: '#bfbfbf' }}>
            Your password has been reset successfully.
          </Text>
          
          <Alert
            message="Success"
            description="You can now login with your new password."
            type="success"
            icon={<CheckCircleOutlined />}
            style={{ 
              marginBottom: 32,
              borderRadius: '8px',
              border: 'none',
              // background: '#f6ffed'
            }}
          />
          
          <Button
            type="primary"
            onClick={() => router.push(`/login${appId !== 'smartgrid-dashboard' ? `?app=${appId}` : ''}`)}
            style={{
              width: '100%',
              height: 48,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Go to Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ 
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
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: success ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: success ? '0 8px 20px rgba(82, 196, 26, 0.3)' : '0 8px 20px rgba(102, 126, 234, 0.3)'
          }}>
            {success ? <CheckCircleOutlined style={{ fontSize: 24, color: 'white' }} /> : <KeyOutlined style={{ fontSize: 24, color: 'white' }} />}
          </div>
          <Title level={2} style={{ margin: 0, color: '#ffffff' }}>
            {success ? 'Password Reset Success!' : 'Reset Password'}
          </Title>
          <Text style={{ fontSize: 16, color: '#bfbfbf' }}>
            {success ? 'Your password has been reset successfully. Please login with your new password.' : 'Enter your new password below.'}
          </Text>
        </div>

        {!success && (
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Enter your new password"
              disabled={loading}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ 
                borderRadius: '8px',
                border: '2px solid #f0f0f0',
                padding: '12px 16px'
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
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Confirm your new password"
              disabled={loading}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ 
                borderRadius: '8px',
                border: '2px solid #f0f0f0',
                padding: '12px 16px'
              }}
            />
          </Form.Item>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              style={{ 
                marginBottom: 16,
                borderRadius: '8px',
                border: 'none'
              }}
            />
          )}

          <Form.Item style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: 48,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form.Item>
        </Form>
        )}

        {success && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              onClick={() => router.push(`/login${appId !== 'smartgrid-dashboard' ? `?app=${appId}` : ''}`)}
              style={{
                width: '100%',
                height: 48,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
              }}
            >
              Go to Login
            </Button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link
            href={`/login${appId !== 'smartgrid-dashboard' ? `?app=${appId}` : ''}`}
            style={{ 
              color: '#667eea', 
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeftOutlined />
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  )
}
