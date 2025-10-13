import { Table } from 'antd'

/**
 * Data table component - wrapper around Ant Design Table
 * Provides consistent styling and behavior across the app
 * @param {Array} columns - Table columns configuration
 * @param {Array} data - Table data
 * @param {boolean} loading - Loading state
 * @param {Object|boolean} pagination - Pagination configuration or false to disable
 * @param {string} rowKey - Row key field
 * @param {Function} onRow - Row click handler
 * @param {Object} props - Additional table props
 */
export default function DataTable({
  columns,
  data,
  loading = false,
  pagination = true,
  rowKey = 'id',
  onRow,
  ...props
}) {
  const defaultPagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    ...pagination,
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination ? defaultPagination : false}
      rowKey={rowKey}
      onRow={onRow}
      scroll={{ x: 'max-content' }}
      {...props}
    />
  )
}
