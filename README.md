# SmartGrid - Professional SaaS Dashboard

A modern, production-ready SaaS dashboard built with Next.js 14, Ant Design, and TanStack Query.

## Features

- 🚀 **Next.js 14** with App Router
- 🎨 **Ant Design** for beautiful UI components
- ⚡ **TanStack Query** for efficient data fetching and caching
- 🔐 **Supabase** for authentication and database
- 💳 **Stripe** integration ready for billing
- 📱 **Fully Responsive** design
- 🎯 **TypeScript-free** JavaScript implementation
- 🔄 **Real-time** data synchronization
- 📊 **Dashboard** with analytics and stats
- 💼 **Multi-app** management system
- 📋 **Profile** and settings management
- 💰 **Billing** and subscription management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (ES6+)
- **UI Library**: Ant Design 5
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Ant Design + CSS Modules
- **Icons**: Ant Design Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for authentication and database)
- Stripe account (optional, for billing features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smartgrid-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smartgrid-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages (login, signup)
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── billing/
│   │   └── apps/[appId]/
│   ├── providers.js              # TanStack Query + Ant Design providers
│   └── layout.js                 # Root layout
├── components/
│   ├── layouts/                  # Layout components
│   │   ├── DashboardLayout.js
│   │   ├── DashboardHeader.js
│   │   └── DashboardSider.js
│   ├── shared/                   # Reusable components
│   │   ├── StatCard.js
│   │   ├── DataTable.js
│   │   ├── PageHeader.js
│   │   ├── LoadingState.js
│   │   ├── ErrorState.js
│   │   ├── EmptyState.js
│   │   └── ConfirmModal.js
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── AppCard.js
│   │   ├── AppsGrid.js
│   │   └── QuickStats.js
│   ├── billing/                  # Billing components
│   │   ├── PlanCard.js
│   │   ├── SubscriptionCard.js
│   │   ├── InvoiceTable.js
│   │   └── PaymentMethodCard.js
│   └── profile/                  # Profile components
│       ├── ProfileForm.js
│       ├── AvatarUpload.js
│       └── SecuritySettings.js
├── lib/
│   ├── api/                      # API layer with Axios
│   │   ├── client.js             # Axios instance
│   │   ├── auth.js
│   │   ├── billing.js
│   │   ├── apps.js
│   │   └── user.js
│   ├── supabase/                 # Supabase clients
│   │   ├── client.js             # Browser client
│   │   └── server.js             # Server client
│   ├── hooks/                    # TanStack Query hooks
│   │   ├── queries/              # Query hooks
│   │   │   ├── useUser.js
│   │   │   ├── useBilling.js
│   │   │   ├── useApps.js
│   │   │   └── useInvoices.js
│   │   └── mutations/            # Mutation hooks
│   │       ├── useUpdateProfile.js
│   │       ├── useUpgradePlan.js
│   │       └── useCancelSubscription.js
│   ├── utils/                    # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   └── queryClient.js            # TanStack Query configuration
├── styles/
│   ├── globals.css               # Global styles
│   └── antd-custom.css           # Ant Design customizations
└── public/                       # Static assets
```

## Key Features

### 1. Authentication
- Email/password signup and login
- Password reset functionality
- Protected routes with middleware
- Session management with Supabase

### 2. Dashboard
- Overview with quick stats
- Apps grid with search functionality
- Real-time data updates
- Responsive layout

### 3. Billing
- Subscription management
- Multiple plan tiers (Free, Pro, Enterprise)
- Invoice history
- Payment method management
- Stripe integration ready

### 4. Profile
- User profile editing
- Avatar upload
- Security settings
- Password change

### 5. Settings
- Notification preferences
- Language and timezone settings
- API key management
- Two-factor authentication (ready to implement)

## Data Fetching with TanStack Query

The app uses TanStack Query for efficient data fetching and caching:

- **Automatic caching** with configurable stale times
- **Background refetching** to keep data fresh
- **Optimistic updates** for better UX
- **Query invalidation** on mutations
- **Loading and error states** handled automatically

Example usage:
```javascript
// Query hook
const { data, isLoading, error } = useUser()

// Mutation hook
const updateProfile = useUpdateProfile()
await updateProfile.mutateAsync(values)
```

## Supabase Database Schema

The app expects the following tables in Supabase:

### `users` table
```sql
- id (uuid, primary key)
- email (text)
- full_name (text)
- avatar_url (text)
- phone (text)
- company (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### `billing` table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- plan (text: 'free', 'pro', 'enterprise')
- status (text: 'active', 'cancelled', etc.)
- credits (integer)
- stripe_customer_id (text)
- stripe_subscription_id (text)
- current_period_end (timestamp)
- cancel_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### `apps` table
```sql
- id (uuid, primary key)
- name (text)
- description (text)
- icon (text)
- url (text)
- status (text)
- requires_subscription (boolean)
- category (text)
- version (text)
- features (jsonb)
- created_at (timestamp)
```

### `app_access` table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- app_id (uuid, foreign key)
- has_access (boolean)
- granted_at (timestamp)
- revoked_at (timestamp)
```

### `invoices` table
```sql
- id (text, primary key)
- user_id (uuid, foreign key)
- amount (integer)
- description (text)
- status (text)
- invoice_pdf (text)
- created_at (timestamp)
```

## Customization

### Ant Design Theme

Edit `app/providers.js` to customize the Ant Design theme:

```javascript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',    // Primary color
      borderRadius: 8,             // Border radius
      colorBgContainer: '#ffffff', // Background color
    },
  }}
>
```

### TanStack Query Configuration

Edit `lib/queryClient.js` to customize query behavior:

```javascript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
})
```

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

The app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker**

Make sure to set environment variables in your deployment platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@smartgrid.com or join our Slack channel.
# smartgrid
# smartgrid
