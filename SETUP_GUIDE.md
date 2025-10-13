# SmartGrid Setup Guide

This guide will walk you through setting up the SmartGrid dashboard from scratch.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher installed
- npm or yarn package manager
- A Supabase account (free tier is fine)
- A Stripe account (optional, for billing features)

## Step 1: Install Dependencies

The dependencies have already been installed, but if you need to reinstall:

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be provisioned (2-3 minutes)

### 2.2 Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGc...`)

### 2.3 Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these SQL commands:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Billing table
CREATE TABLE public.billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active',
  credits INTEGER DEFAULT 100,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing"
  ON public.billing FOR SELECT
  USING (auth.uid() = user_id);

-- Apps table
CREATE TABLE public.apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  url TEXT,
  status TEXT DEFAULT 'active',
  requires_subscription BOOLEAN DEFAULT false,
  category TEXT,
  version TEXT,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view apps"
  ON public.apps FOR SELECT
  TO authenticated
  USING (true);

-- App access table
CREATE TABLE public.app_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  app_id UUID REFERENCES public.apps(id) NOT NULL,
  has_access BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, app_id)
);

ALTER TABLE public.app_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app access"
  ON public.app_access FOR SELECT
  USING (auth.uid() = user_id);

-- Invoices table
CREATE TABLE public.invoices (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'paid',
  invoice_pdf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

-- App usage tracking table
CREATE TABLE public.app_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  app_id UUID REFERENCES public.apps(id) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own usage"
  ON public.app_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2.4 Create Storage Bucket for Avatars

1. Go to **Storage** in Supabase
2. Create a new bucket called `avatars`
3. Set it to **Public**
4. Add policy for uploads:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to read avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 2.5 Insert Sample Data

```sql
-- Insert sample apps
INSERT INTO public.apps (name, description, icon, url, requires_subscription, category) VALUES
  ('Analytics Dashboard', 'View detailed analytics and insights', '📊', 'https://analytics.example.com', false, 'Analytics'),
  ('Email Marketing', 'Send and track email campaigns', '📧', 'https://email.example.com', true, 'Marketing'),
  ('CRM System', 'Manage customer relationships', '👥', 'https://crm.example.com', true, 'Sales'),
  ('Chat Support', 'Live chat with customers', '💬', 'https://chat.example.com', true, 'Support'),
  ('File Storage', 'Store and share files securely', '☁️', 'https://storage.example.com', true, 'Productivity'),
  ('Video Conferencing', 'Host video meetings', '🎥', 'https://video.example.com', true, 'Communication'),
  ('Project Management', 'Track projects and tasks', '📋', 'https://projects.example.com', false, 'Productivity'),
  ('Calendar', 'Schedule and manage events', '📅', 'https://calendar.example.com', false, 'Productivity');
```

### 2.6 Set Up Database Triggers

```sql
-- Function to automatically create billing record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.billing (user_id, plan, status, credits)
  VALUES (NEW.id, 'free', 'active', 100);
  
  -- Grant access to free apps
  INSERT INTO public.app_access (user_id, app_id, has_access, granted_at)
  SELECT NEW.id, id, true, NOW()
  FROM public.apps
  WHERE requires_subscription = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace the placeholders with your actual values from Supabase.

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Step 5: Test Authentication

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create a test account
3. Check your email for a confirmation link (if email confirmation is enabled)
4. Log in with your credentials
5. You should see the dashboard with sample apps

## Step 6: Optional - Set Up Stripe (For Billing)

### 6.1 Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for an account
3. Get your publishable key from the **Developers** section

### 6.2 Create Products and Prices

1. In Stripe Dashboard, go to **Products**
2. Create two products:
   - **Pro Plan** - $29/month
   - **Enterprise Plan** - $99/month
3. Copy the price IDs and update them in:
   - `app/(dashboard)/billing/plans/page.js` (in the `priceIds` object)

### 6.3 Set Up Webhooks

1. Create a webhook endpoint in Stripe pointing to: `https://your-domain.com/api/webhooks/stripe`
2. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

## Step 7: Customization

### Change Theme Colors

Edit `app/providers.js`:

```javascript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#your-color',  // Change primary color
      borderRadius: 8,
      colorBgContainer: '#ffffff',
    },
  }}
>
```

### Modify Plans

Edit `lib/utils/constants.js` to change plan details, pricing, and features.

### Add Custom Apps

Insert new apps into the `apps` table or create an admin interface to manage them.

## Troubleshooting

### Issue: "Invalid API key"
- Check that your Supabase URL and Anon Key are correct in `.env.local`
- Restart the dev server after changing environment variables

### Issue: "Database connection failed"
- Verify your Supabase project is active
- Check that RLS policies are properly configured

### Issue: "Can't see any apps"
- Make sure you've inserted sample apps into the database
- Check that the app_access policies allow reading

### Issue: Authentication not working
- Verify Supabase Auth is enabled in your project
- Check that email confirmation settings match your needs
- Look for errors in the browser console

## Next Steps

1. **Deploy to Production**: Deploy to Vercel or your preferred hosting platform
2. **Set Up Domain**: Configure a custom domain
3. **Enable Email**: Set up SMTP in Supabase for transactional emails
4. **Add Analytics**: Integrate Google Analytics or similar
5. **Customize UI**: Modify components to match your brand
6. **Add Features**: Build additional features specific to your needs

## Support

If you need help:
- Check the [README.md](./README.md) for more details
- Review the [Next.js documentation](https://nextjs.org/docs)
- Visit [Supabase documentation](https://supabase.com/docs)
- Check [Ant Design documentation](https://ant.design/docs/react/introduce)
- Review [TanStack Query documentation](https://tanstack.com/query/latest)

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use environment variables** for all secrets
3. **Enable RLS** on all Supabase tables
4. **Validate user input** on both client and server
5. **Use HTTPS** in production
6. **Keep dependencies updated** regularly
7. **Implement rate limiting** for API endpoints
8. **Use CSP headers** for additional security

Happy coding! 🚀
