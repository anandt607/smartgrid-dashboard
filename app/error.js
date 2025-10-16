'use client'

import { Result, Button } from 'antd'
import { useEffect } from 'react'

/**
 * Error boundary for the root layout
 * Catches and handles errors in the app
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('🔴 App Error Caught:', error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#0a0a0a'
    }}>
      <Result
        status="error"
        title="Something went wrong"
        subTitle={
          process.env.NODE_ENV === 'development' 
            ? error?.message || 'An unexpected error occurred. Please try again.'
            : 'An unexpected error occurred. Please try again.'
        }
        extra={[
          <Button type="primary" key="retry" onClick={() => reset()}>
            Try Again
          </Button>,
          <Button key="home" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>,
        ]}
      />
    </div>
  )
}

