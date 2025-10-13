import { Spin } from 'antd'

/**
 * Loading state component
 * Shows a centered loading spinner
 * @param {string} size - Size of the spinner (small, default, large)
 * @param {string} tip - Loading message to display
 */
export default function LoadingState({ size = 'large', tip = 'Loading...' }) {
  return (
    <div className="loading-container">
      <Spin size={size} tip={tip} />
    </div>
  )
}
