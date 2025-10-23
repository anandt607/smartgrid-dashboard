'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, Form, Input, Button, Typography, message, Alert, Space, Spin } from 'antd'
import { ArrowLeftOutlined, MailOutlined, CheckCircleOutlined, SendOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import Link from 'next/link'

const { Text, Title } = Typography

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form] = Form.useForm()
  const router = useRouter()
  const searchParams = useSearchParams()
  const appId = searchParams.get('app') || 'smartgrid-dashboard'

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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Source': appId,
        },
        body: JSON.stringify({
          email: values.email,
          appId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No account found with this email address. Please check your email or create a new account.')
        } else {
          throw new Error(data.error || 'Failed to send reset email')
        }
      }

      setSuccess(true)
      message.success('Password reset email sent successfully!')
    } catch (err) {
      setError(err.message)
      message.error(err.message)
    } finally {
      setLoading(false)
    }
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
          
          <Title level={2} style={{ margin: '0 0 16px', color: '#ffffff' }}>Check Your Email</Title>
          <Text style={{ display: 'block', marginBottom: 32, fontSize: 16, color: '#bfbfbf' }}>
            We&apos;ve sent a password reset link to your email address.
          </Text>
          
          <Alert
            message="Email Sent Successfully"
            description="Please check your inbox and click the reset link to create a new password."
            type="success"
            icon={<MailOutlined />}
            style={{ 
              marginBottom: 32,
              borderRadius: '8px',
              border: 'none',
              // background: '#f6ffed'
            }}
          />
          
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.5 }}>
              Didn&apos;t receive the email? Check your spam folder or try again.
            </Text>
          </div>
          
          <Button
            type="default"
            onClick={() => {
              setSuccess(false)
              form.resetFields()
            }}
            style={{ 
              width: '100%',
              height: 44,
              borderRadius: '8px',
              border: '2px solid #f0f0f0',
              fontSize: 15,
              fontWeight: 500
            }}
          >
            Try Again
          </Button>
        </Card>
      </div>
    )
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
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <MailOutlined style={{ fontSize: 24, color: 'white' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#ffffff' }}>Forgot Password</Title>
          <Text style={{ fontSize: 16, color: '#bfbfbf' }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#667eea' }} />}
              placeholder="Enter your email address"
              disabled={loading}
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
              icon={!loading && <SendOutlined />}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
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
