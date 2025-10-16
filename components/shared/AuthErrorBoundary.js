import React from 'react'
import { Alert, Button, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

/**
 * Error boundary specifically for authentication-related errors
 * Shows a more user-friendly message instead of "Something went wrong"
 */
class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Check if this is an authentication-related error
    const isAuthError = 
      error?.message?.includes('Not authenticated') ||
      error?.message?.includes('Auth session missing') ||
      error?.message?.includes('Unauthorized') ||
      error?.status === 401

    return { 
      hasError: true, 
      error,
      isAuthError
    }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('AuthErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // If it's an auth error, redirect to login instead of showing error
      if (this.state.isAuthError) {
        // Redirect to login in next tick to avoid render loop
        setTimeout(() => {
          window.location.href = '/login'
        }, 0)
        
        return (
          <div style={{ 
            padding: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <Space direction="vertical" align="center">
              <div>Redirecting to login...</div>
            </Space>
          </div>
        )
      }

      // For other errors, show a user-friendly error message
      return (
        <div style={{ padding: '20px' }}>
          <Alert
            type="error"
            showIcon
            message="Unable to load content"
            description="Please try refreshing the page. If the problem persists, try logging out and back in."
            action={
              <Space>
                <Button 
                  size="small" 
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => window.location.href = '/login'}
                >
                  Login
                </Button>
              </Space>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default AuthErrorBoundary
