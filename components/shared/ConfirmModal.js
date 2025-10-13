import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

/**
 * Reusable confirmation modal
 * @param {string} title - Modal title
 * @param {string} content - Modal content/message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 * @param {boolean} visible - Modal visibility
 * @param {string} okText - OK button text
 * @param {string} cancelText - Cancel button text
 * @param {boolean} danger - Show as dangerous action
 */
export default function ConfirmModal({
  title = 'Confirm',
  content,
  onConfirm,
  onCancel,
  visible,
  okText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}) {
  return (
    <Modal
      title={
        <div>
          <ExclamationCircleOutlined style={{ color: danger ? '#ff4d4f' : '#faad14', marginRight: 8 }} />
          {title}
        </div>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
    >
      {content}
    </Modal>
  )
}

/**
 * Show confirm dialog (alternative imperative API)
 */
export const showConfirm = ({ title, content, onOk, onCancel, okText, cancelText, danger = false }) => {
  Modal.confirm({
    title,
    content,
    icon: <ExclamationCircleOutlined />,
    okText: okText || 'Confirm',
    cancelText: cancelText || 'Cancel',
    onOk,
    onCancel,
    okButtonProps: { danger },
  })
}
