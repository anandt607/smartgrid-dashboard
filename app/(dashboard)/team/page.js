'use client'

import { useState, useEffect } from 'react'
import { Space, Card, Button, Alert, Statistic, Row, Col, Typography, Skeleton } from 'antd'
import { PlusOutlined, TeamOutlined, UserAddOutlined, CrownOutlined } from '@ant-design/icons'
import PageHeader from '@/components/shared/PageHeader'
import LoadingState from '@/components/shared/LoadingState'
import TeamPageSkeleton from '@/components/shared/TeamPageSkeleton'
import OrganizationSkeleton from '@/components/shared/OrganizationSkeleton'
import ErrorState from '@/components/shared/ErrorState'
import InviteMemberModal from '@/components/team/InviteMemberModal'
import MemberTable from '@/components/team/MemberTable'
import { useOrganization } from '@/lib/hooks/queries/useOrganization'
import { useTeamMembers, useRemoveMember } from '@/lib/hooks/queries/useTeamMembers'

const { Title } = Typography

/**
 * Team management page
 * Displays organization members and allows inviting/removing members
 */
export default function TeamPage() {
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  
  // Get organization data
  const { 
    organization, 
    organizationId, 
    organizationRole, 
    canInviteMembers,
    billing,
    maxMembers,
    currentMembers,
    isLoading: orgLoading 
  } = useOrganization()

  // Get team members
  const { 
    data: teamData, 
    isLoading: membersLoading, 
    isFetching: membersFetching,
    error: membersError,
    refetch: refetchMembers 
  } = useTeamMembers(organizationId)

  const allMembers = teamData?.members || []
  // Filter out owners from the table display (owners should not appear in the members table)
  const members = allMembers.filter(member => member.role !== 'owner')
  const currentUserRole = teamData?.current_user_role
  const currentUserId = organization?.user_id

  // Remove member mutation
  const { mutate: removeMember } = useRemoveMember()

  // Handle member removal
  const handleRemoveMember = async (member) => {
    return new Promise((resolve, reject) => {
      removeMember(
        { userId: member.id, organizationId },
        {
          onSuccess: resolve,
          onError: reject
        }
      )
    })
  }

  // Handle invite success
  const handleInviteSuccess = () => {
    refetchMembers()
  }

  // Handle member edit success
  const handleMemberEditSuccess = () => {
    refetchMembers()
  }

  // Calculate stats (include all members including owners)
  const stats = {
    totalMembers: allMembers.length,
    adminCount: allMembers.filter(m => m.role === 'admin').length,
    memberCount: allMembers.filter(m => m.role === 'member').length,
    ownerCount: allMembers.filter(m => m.role === 'owner').length
  }

  // Check if at member limit (include all members including owners)
  const isAtMemberLimit = maxMembers && (currentMembers || allMembers.length) >= maxMembers

  if (orgLoading || membersLoading) {
    return <TeamPageSkeleton />
  }

  if (!organization) {
    return (
      <ErrorState 
        title="No Organization" 
        message="You must be part of an organization to manage team members."
      />
    )
  }

  if (membersError) {
    return (
      <ErrorState 
        error={membersError} 
        onRetry={refetchMembers}
        title="Failed to Load Team Members"
      />
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Page Header */}
      {orgLoading ? (
        <Card>
          <Skeleton.Input active size="large" style={{ width: 300, height: 40 }} />
          <Skeleton.Input active size="small" style={{ width: 200, height: 20, marginTop: 8 }} />
        </Card>
      ) : (
        <PageHeader
          title="Team Management"
          subtitle={`Manage ${organization.name} team members`}
          breadcrumb={[
            { title: 'Dashboard', href: '/' },
            { title: 'Team' }
          ]}
          extra={
            canInviteMembers && !isAtMemberLimit ? [
              <Button 
                key="invite"
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setInviteModalVisible(true)}
                size="large"
              >
                Invite Member
              </Button>
            ] : []
          }
        />
      )}

      {/* Member limit warning */}
      {isAtMemberLimit && (
        <Alert
          type="warning"
          showIcon
          message="Member Limit Reached"
          description={`Your current plan allows up to ${maxMembers} members. Upgrade your plan to invite more team members.`}
          action={
            <Button size="small" href="/billing/plans">
              Upgrade Plan
            </Button>
          }
        />
      )}

      {/* Team Statistics */}
      {orgLoading ? (
        <OrganizationSkeleton />
      ) : (
        <Card>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Total Members"
                value={stats.totalMembers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Owners"
                value={stats.ownerCount}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Admins"
                value={stats.adminCount}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Members"
                value={stats.memberCount}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Members Table */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>Team Members</span>
            <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}>
              (Owners not shown)
            </span>
          </Space>
        }
        extra={
          <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
            {maxMembers ? `${currentMembers || allMembers.length} / ${maxMembers} members` : `${allMembers.length} members`}
          </span>
        }
      >
        <MemberTable
          members={members}
          loading={membersLoading || membersFetching}
          onRemove={handleRemoveMember}
          onEdit={handleMemberEditSuccess}
          currentUserRole={currentUserRole || organizationRole}
          currentUserId={currentUserId}
          organizationId={organizationId}
        />
      </Card>

      {/* Invite Member Modal */}
      <InviteMemberModal
        visible={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        onSuccess={handleInviteSuccess}
        organizationId={organizationId}
      />
    </Space>
  )
}
