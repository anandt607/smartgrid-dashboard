import { Empty, Button } from 'antd'

/**
 * Empty state component
 * Shows an empty data message with optional action button
 * @param {string} description - Description of the empty state
 * @param {Object} action - Action button configuration { text, onClick }
 */
export default function EmptyState({ description = 'No data available', action }) {
  return (
    <div style={{ padding: '48px 0' }}>
      <Empty
        description={description}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {action && (
          <Button type="primary" onClick={action.onClick}>
            {action.text}
          </Button>
        )}
      </Empty>
    </div>
  )
}
