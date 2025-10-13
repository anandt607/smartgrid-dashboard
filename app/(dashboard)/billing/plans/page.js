'use client'

import { Row, Col, Space } from 'antd'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import SupabasePlanCard from '@/components/billing/SupabasePlanCard'
import LoadingState from '@/components/shared/LoadingState'
import { useUser } from '@/lib/hooks/queries/useUser'
import { useBilling } from '@/lib/hooks/queries/useBilling'
import { useUpgradePlan } from '@/lib/hooks/mutations/useUpgradePlan'
import { usePlans } from '@/lib/hooks/queries/usePlans'
import PageTransition from '@/components/shared/PageTransition'

/**
 * Plans page
 * Shows all available subscription plans
 */
export default function PlansPage() {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: billing, isLoading: billingLoading } = useBilling(user?.id)
  const { data: plans, isLoading: plansLoading } = usePlans()
  const upgradePlan = useUpgradePlan()

  // Handle plan selection
  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) {
      router.push('/billing')
      return
    }

    try {
      await upgradePlan.mutateAsync({
        plan: plan.name,
        priceId: plan.id, // This is the stripe_price_id
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  if (billingLoading || plansLoading) {
    return <LoadingState tip="Loading plans..." />
  }

  if (!plans || plans.length === 0) {
    return <LoadingState tip="No plans available" />
  }

  return (
    <PageTransition>
      <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
        {/* Page Header */}
        <PageHeader
          title="Choose Your Plan"
          subtitle="Select the plan that best fits your needs"
          breadcrumb={[{ title: 'Billing', href: '/billing' }, { title: 'Plans' }]}
        />

        {/* Plans Grid */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {plans.map((plan, index) => (
            <Col key={plan.id} xs={24} sm={24} md={8}>
              <SupabasePlanCard
                plan={plan}
                currentPlan={billing?.stripe_price_id === plan.id}
                onSelect={() => handleSelectPlan(plan)}
                loading={upgradePlan.isLoading}
                recommended={plan.isPopular}
                index={index}
              />
            </Col>
          ))}
        </Row>

        {/* Feature Comparison */}
        <div className="glass" style={{ marginTop: 48, padding: 32, borderRadius: 16 }}>
          <h3 style={{ marginBottom: 16, fontSize: 20, fontWeight: 600 }}>
            Need help choosing the right plan?
          </h3>
          <p style={{ fontSize: 16, marginBottom: 0, lineHeight: 1.6 }}>
            Our team is here to help you find the perfect solution for your needs.
            <br />
            Contact us at <a href="mailto:sales@smartgrid.com" style={{ color: 'var(--primary)' }}>
              sales@smartgrid.com
            </a> for a personalized consultation.
          </p>
        </div>
      </Space>
    </PageTransition>
  )
}
