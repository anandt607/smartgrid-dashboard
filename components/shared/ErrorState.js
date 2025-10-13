import { Result, Button } from 'antd'

/**
 * Error state component
 * Shows an error message with optional retry button
 * @param {Object} error - Error object
 * @param {Function} onRetry - Callback function to retry the action
 */
export default function ErrorState({ error, onRetry }) {
  return (
    <div style={{ padding: '48px 0' }}>
      <Result
        status="error"
        title="Something went wrong"
        subTitle={error?.message || 'An unexpected error occurred. Please try again.'}
        extra={
          onRetry && (
            <Button type="primary" onClick={onRetry}>
              Try Again
            </Button>
          )
        }
      />
    </div>
  )
}
