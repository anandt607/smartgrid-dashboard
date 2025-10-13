'use client'

import { Row, Col, Card, Space, Descriptions, Typography } from 'antd'
import PageHeader from '@/components/shared/PageHeader'
import ProfileForm from '@/components/profile/ProfileForm'
import AvatarUpload from '@/components/profile/AvatarUpload'
import SecuritySettings from '@/components/profile/SecuritySettings'
import LoadingState from '@/components/shared/LoadingState'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useUpdateProfile } from '@/lib/hooks/mutations/useUpdateProfile'
import { uploadAvatar } from '@/lib/api/user'
import { updatePassword } from '@/lib/api/auth'
import { formatDate } from '@/lib/utils/helpers'
import { message } from 'antd'

const { Text } = Typography

/**
 * Profile page
 * Allows users to view and edit their profile
 */
export default function ProfilePage() {
  const { data: user, isLoading } = useUser()
  const updateProfile = useUpdateProfile()

  // Handle profile form submission
  const handleProfileSubmit = async (values) => {
    try {
      await updateProfile.mutateAsync(values)
    } catch (error) {
      // Error is handled by mutation
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    try {
      const avatarUrl = await uploadAvatar(file)
      await updateProfile.mutateAsync({ avatar_url: avatarUrl })
    } catch (error) {
      throw error
    }
  }

  // Handle password change
  const handlePasswordChange = async (newPassword) => {
    try {
      await updatePassword(newPassword)
      message.success('Password changed successfully!')
    } catch (error) {
      message.error(error?.message || 'Failed to change password')
    }
  }

  if (isLoading) {
    return <LoadingState tip="Loading profile..." />
  }

  const initialValues = {
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    company: user?.profile?.company || '',
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Page Header */}
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and account settings"
        breadcrumb={[{ title: 'Profile' }]}
      />

      <Row gutter={[24, 24]}>
        {/* Profile Info Card */}
        <Col xs={24} lg={8}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%', alignItems: 'center' }}>
              {/* Avatar Upload */}
              <AvatarUpload
                currentAvatar={user?.user_metadata?.avatar_url}
                userName={user?.user_metadata?.full_name || user?.email}
                onUpload={handleAvatarUpload}
                loading={updateProfile.isLoading}
              />

              {/* User Info */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <h3 style={{ margin: 0 }}>
                  {user?.user_metadata?.full_name || 'User'}
                </h3>
                <Text type="secondary">{user?.email}</Text>
              </div>

              {/* Account Details */}
              <Descriptions column={1} size="small" style={{ width: '100%' }}>
                <Descriptions.Item label="User ID">
                  <Text copyable style={{ fontSize: 12 }}>
                    {user?.id?.slice(0, 8)}...
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Member Since">
                  {formatDate(user?.created_at)}
                </Descriptions.Item>
                <Descriptions.Item label="Email Verified">
                  {user?.email_confirmed_at ? 'Yes' : 'No'}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        {/* Profile Form */}
        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <ProfileForm
              initialValues={initialValues}
              onSubmit={handleProfileSubmit}
              loading={updateProfile.isLoading}
            />
          </Card>

          {/* Security Settings */}
          <div style={{ marginTop: 24 }}>
            <SecuritySettings onPasswordChange={handlePasswordChange} />
          </div>
        </Col>
      </Row>
    </Space>
  )
}
