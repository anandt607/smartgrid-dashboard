import { Card, Statistic } from 'antd'

/**
 * Statistic card component
 * Displays a statistic with optional prefix, suffix, and loading state
 * @param {string} title - Statistic title
 * @param {number|string} value - Statistic value
 * @param {ReactNode} prefix - Prefix element (icon, text)
 * @param {ReactNode} suffix - Suffix element
 * @param {Object} valueStyle - Custom styles for the value
 * @param {boolean} loading - Loading state
 */
export default function StatCard({ 
  title, 
  value, 
  prefix, 
  suffix, 
  valueStyle = {}, 
  loading = false 
}) {
  return (
    <Card className="stat-card" loading={loading} bordered={false}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
    </Card>
  )
}
