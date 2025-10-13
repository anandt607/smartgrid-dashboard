'use client'

import { Space, Row, Col, Card, Typography } from 'antd'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import SubscriptionCard from '@/components/billing/SubscriptionCard'
import InvoiceTable from '@/components/billing/InvoiceTable'
import PaymentMethodCard from '@/components/billing/PaymentMethodCard'
import LoadingState from '@/components/shared/LoadingState'
import { showConfirm } from '@/components/shared/ConfirmModal'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useBilling } from '@/lib/hooks/queries/useBilling'
import { useInvoices } from '@/lib/hooks/queries/useInvoices'
import { useCancelSubscription } from '@/lib/hooks/mutations/useCancelSubscription'
import { createPortalSession } from '@/lib/api/billing'
import { message } from 'antd'

const { Title } = Typography

/**
 * Billing page
 * Shows subscription details, invoices, and payment methods
 */
export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data: user } = useUser()
  const { data: billing, isLoading: billingLoading, refetch: refetchBilling } = useBilling(user?.id)
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices(user?.id, currentPage)
  const cancelSubscription = useCancelSubscription(user?.id)

  // Check for success parameter from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    
    if (success === 'true' && sessionId) {
      message.success('🎉 Subscription upgraded successfully!')
      // Refetch billing data
      refetchBilling()
      // Clean URL
      router.replace('/billing')
    }
  }, [searchParams, refetchBilling, router])

  // Handle manage billing (Stripe portal)
  const handleManageBilling = async () => {
    try {
      const { url } = await createPortalSession()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      message.error('Failed to open billing portal')
    }
  }

  // Handle cancel subscription
  const handleCancelSubscription = () => {
    showConfirm({
      title: 'Cancel Subscription',
      content: 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      onOk: async () => {
        try {
          await cancelSubscription.mutateAsync(billing.stripe_subscription_id)
        } catch (error) {
          // Error handled by mutation
        }
      },
      danger: true,
      okText: 'Yes, Cancel',
      cancelText: 'Keep Subscription',
    })
  }

  // Handle add payment method
  const handleAddPaymentMethod = async () => {
    // Open Stripe portal
    await handleManageBilling()
  }

  if (billingLoading) {
    return <LoadingState tip="Loading billing information..." />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
      {/* Page Header */}
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription, invoices, and payment methods"
        breadcrumb={[{ title: 'Billing' }]}
        extra={
          <button
            onClick={() => router.push('/billing/plans')}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            View Plans
          </button>
        }
      />

      <Row gutter={[24, 24]}>
        {/* Subscription Card */}
        <Col xs={24}>
          <SubscriptionCard
            billing={billing}
            onManage={handleManageBilling}
            onCancel={handleCancelSubscription}
            loading={cancelSubscription.isLoading}
          />
        </Col>

        {/* Payment Methods */}
        <Col xs={24} lg={12}>
          <PaymentMethodCard
            paymentMethods={[]} // Would come from API
            onAdd={handleAddPaymentMethod}
          />
        </Col>

        {/* Billing Stats */}
        <Col xs={24} lg={12}>
          <Card title="Billing Summary">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Plan:</span>
                <strong>{billing?.plan?.toUpperCase() || 'FREE'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status:</span>
                <strong>{billing?.status?.toUpperCase() || 'ACTIVE'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Available Credits:</span>
                <strong>{billing?.credits?.toLocaleString() || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Invoices:</span>
                <strong>{invoicesData?.total || 0}</strong>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Invoices Section */}
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          Invoice History
        </Title>
        <InvoiceTable
          invoices={invoicesData?.invoices || []}
          loading={invoicesLoading}
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: invoicesData?.total || 0,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </div>
    </Space>
  )
}
