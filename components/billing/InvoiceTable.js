import { Tag } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import DataTable from '@/components/shared/DataTable'
import { formatDate, formatCurrency } from '@/lib/utils/helpers'

/**
 * Invoice table component
 * Displays invoice history in a table
 * @param {Array} invoices - Array of invoice objects
 * @param {boolean} loading - Loading state
 * @param {Object} pagination - Pagination configuration
 */
export default function InvoiceTable({ invoices = [], loading = false, pagination }) {
  const columns = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.slice(0, 8)}`,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount / 100), // Stripe amounts are in cents
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          paid: 'success',
          pending: 'processing',
          failed: 'error',
          refunded: 'warning',
        }
        return (
          <Tag color={colorMap[status] || 'default'}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        )
      },
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Failed', value: 'failed' },
        { text: 'Refunded', value: 'refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <a
          href={record.invoice_pdf || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1890ff' }}
        >
          <DownloadOutlined /> Download
        </a>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={invoices}
      loading={loading}
      pagination={pagination}
      rowKey="id"
    />
  )
}
