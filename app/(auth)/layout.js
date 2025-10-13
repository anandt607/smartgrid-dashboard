'use client'

import '@/styles/auth.css'

/**
 * Auth layout wrapper for login/signup pages
 * Provides centered layout with branding
 */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {/* Brand Header */}
        <div className="auth-brand">
          <h1>SmartGrid</h1>
          <h4>Professional SaaS Dashboard</h4>
        </div>

        {/* Auth Form */}
        {children}
      </div>
    </div>
  )
}
