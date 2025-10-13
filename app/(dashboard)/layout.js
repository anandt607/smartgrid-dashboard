import DashboardLayout from '@/components/layouts/DashboardLayout'

/**
 * Dashboard layout wrapper
 * Wraps all dashboard pages with the DashboardLayout component
 */
export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
