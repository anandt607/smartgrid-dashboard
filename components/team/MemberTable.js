import { useState } from 'react'
import { 
  Table, 
  Tag, 
  Avatar, 
  Dropdown, 
  Button, 
  Space, 
  Tooltip, 
  message,
  Modal 
} from 'antd'
import { 
  UserOutlined, 
  MoreOutlined, 
  DeleteOutlined, 
  EditOutlined,
  CrownOutlined,
  SafetyOutlined,
  TeamOutlined
} from '@ant-design/icons'
import EditMemberModal from './EditMemberModal'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/**
 * Table component for displaying organization members
 * @param {Array} members - Array of member objects
 * @param {boolean} loading - Loading state
 * @param {Function} onRemove - Remove member handler
 * @param {Function} onEdit - Edit member handler
 * @param {string} currentUserRole - Current user's role
 * @param {string} currentUserId - Current user's ID
 * @param {string} organizationId - Organization ID
 */
export default function MemberTable({ 
  members = [], 
  loading = false, 
  onRemove, 
  onEdit,
  currentUserRole,
  currentUserId,
  organizationId
}) {
  const [removeLoading, setRemoveLoading] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  // Handle member removal
  const handleRemove = async (member) => {
    Modal.confirm({
      title: 'Remove Team Member',
      content: `Are you sure you want to remove ${member.first_name} ${member.last_name} from the organization?`,
      okText: 'Remove',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setRemoveLoading(member.id)
          await onRemove?.(member)
          message.success(`${member.first_name} has been removed from the organization`)
        } catch (error) {
          message.error(error.message || 'Failed to remove member')
        } finally {
          setRemoveLoading(null)
        }
      }
    })
  }

  // Handle member edit
  const handleEdit = (member) => {
    setSelectedMember(member)
    setEditModalVisible(true)
  }

  // Handle edit modal close
  const handleEditModalClose = () => {
    setEditModalVisible(false)
    setSelectedMember(null)
  }

  // Handle edit success
  const handleEditSuccess = () => {
    onEdit?.()
    handleEditModalClose()
  }

  // Check if current user can perform actions on target member
  const canPerformActions = (targetMember) => {
    // Can't perform actions on self (except owner removing self)
    if (targetMember.id === currentUserId && currentUserRole !== 'owner') {
      return false
    }
    
    // Only owners and admins can remove members
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return false
    }
    
    // Non-owners can't remove owners or admins
    if (currentUserRole !== 'owner' && (targetMember.role === 'owner' || targetMember.role === 'admin')) {
      return false
    }
    
    // Can't remove the organization owner (unless owner removing self)
    if (targetMember.role === 'owner' && targetMember.id !== currentUserId) {
      return false
    }
    
    return true
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <CrownOutlined style={{ color: '#faad14' }} />
      case 'admin':
        return <SafetyOutlined style={{ color: '#1890ff' }} />
      default:
        return <TeamOutlined style={{ color: '#52c41a' }} />
    }
  }

  // Get role tag color
  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'gold'
      case 'admin':
        return 'blue'
      default:
        return 'green'
    }
  }

  // Table columns
  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (_, member) => (
        <Space>
          <Avatar 
            size={40}
            src={member.avatar_url}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {member.first_name} {member.last_name}
              {member.is_current_user && (
                <Tag color="blue" style={{ marginLeft: 8 }}>You</Tag>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {member.email}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Joined',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (date) => (
        <Tooltip title={dayjs(date).format('MMMM D, YYYY at h:mm A')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      )
    },
    {
      title: 'Invited By',
      dataIndex: 'invited_by',
      key: 'invited_by',
      render: (invitedBy) => (
        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {invitedBy}
        </span>
      )
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
      render: (date) => {
        if (!date) {
          return <span style={{ color: '#8c8c8c' }}>Never</span>
        }
        return (
          <Tooltip title={dayjs(date).format('MMMM D, YYYY at h:mm A')}>
            <span style={{ color: '#8c8c8c' }}>
              {dayjs(date).fromNow()}
            </span>
          </Tooltip>
        )
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, member) => {
        if (!canPerformActions(member)) {
          return <span style={{ color: '#d9d9d9' }}>—</span>
        }

        const menuItems = [
          {
            key: 'edit',
            label: 'Edit member',
            icon: <EditOutlined />,
            disabled: removeLoading === member.id
          },
          {
            type: 'divider'
          },
          {
            key: 'remove',
            label: 'Remove from organization',
            icon: <DeleteOutlined />,
            danger: true,
            disabled: removeLoading === member.id
          }
        ]

        return (
          <Dropdown 
            menu={{ 
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'edit') {
                  handleEdit(member)
                } else if (key === 'remove') {
                  handleRemove(member)
                }
              }
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />}
              loading={removeLoading === member.id}
            />
          </Dropdown>
        )
      }
    }
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `${total} member${total !== 1 ? 's' : ''}`,
        }}
        scroll={{ x: 800 }}
      />
      
      <EditMemberModal
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        onSuccess={handleEditSuccess}
        member={selectedMember}
        organizationId={organizationId}
      />
    </>
  )
}
