import { useState } from 'react'
import { Avatar, Upload, message } from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import { getInitials } from '@/lib/utils/helpers'

/**
 * Avatar upload component
 * Allows users to upload and change their avatar
 * @param {string} currentAvatar - Current avatar URL
 * @param {string} userName - User name for initials
 * @param {Function} onUpload - Upload handler function
 * @param {boolean} loading - Loading state
 */
export default function AvatarUpload({ currentAvatar, userName, onUpload, loading = false }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return false
    }

    // Validate file size (max 2MB)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
      return false
    }

    try {
      setUploading(true)
      await onUpload(file)
      message.success('Avatar uploaded successfully!')
    } catch (error) {
      message.error('Failed to upload avatar')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }

    return false // Prevent default upload behavior
  }

  return (
    <div className="avatar-upload-wrapper">
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleUpload}
        disabled={loading || uploading}
      >
        <Avatar
          size={120}
          src={currentAvatar}
          icon={!currentAvatar && <UserOutlined />}
          style={{ cursor: 'pointer' }}
        >
          {!currentAvatar && getInitials(userName)}
        </Avatar>
        <div className="avatar-upload-overlay">
          <CameraOutlined style={{ fontSize: 32, color: 'white' }} />
        </div>
      </Upload>
    </div>
  )
}
