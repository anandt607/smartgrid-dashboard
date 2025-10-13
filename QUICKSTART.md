# Quick Start Guide

Get up and running with SmartGrid in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free)

## Quick Setup

### 1. Install Dependencies

Dependencies are already installed! If you need to reinstall:

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings → API
3. Create a `.env.local` file:

```bash
cp env.example .env.local
```

4. Edit `.env.local` and add your Supabase credentials

### 3. Create Database Tables

In your Supabase SQL Editor, run this minimal setup:

```sql
-- Users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Billing table
CREATE TABLE public.billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own billing" ON public.billing FOR SELECT USING (auth.uid() = user_id);

-- Apps table
CREATE TABLE public.apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  url TEXT,
  status TEXT DEFAULT 'active',
  requires_subscription BOOLEAN DEFAULT false
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view apps" ON public.apps FOR SELECT TO authenticated USING (true);

-- App access table
CREATE TABLE public.app_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  app_id UUID REFERENCES public.apps(id) NOT NULL,
  has_access BOOLEAN DEFAULT false,
  UNIQUE(user_id, app_id)
);

ALTER TABLE public.app_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own app access" ON public.app_access FOR SELECT USING (auth.uid() = user_id);

-- Auto-create billing on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.billing (user_id, plan, credits) VALUES (NEW.id, 'free', 100);
  INSERT INTO public.app_access (user_id, app_id, has_access)
  SELECT NEW.id, id, true FROM public.apps WHERE requires_subscription = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample apps
INSERT INTO public.apps (name, description, icon, requires_subscription) VALUES
  ('Dashboard', 'Analytics dashboard', '📊', false),
  ('Email', 'Email marketing', '📧', true),
  ('CRM', 'Customer management', '👥', true),
  ('Chat', 'Live chat support', '💬', true);
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create an Account

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Sign up with any email and password
3. Start exploring!

## What's Included?

✅ **Authentication**: Login, signup, password reset  
✅ **Dashboard**: App management with beautiful UI  
✅ **Profile**: User profile editing with avatar upload  
✅ **Billing**: Subscription management (Stripe ready)  
✅ **Settings**: User preferences and security  
✅ **Responsive Design**: Works on mobile, tablet, and desktop  

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Ant Design** - Professional UI components
- **TanStack Query** - Powerful data fetching
- **Supabase** - Authentication and database
- **Tailwind CSS** - Utility-first styling

## Key Features

### 🎯 TanStack Query Integration
Efficient data fetching with automatic caching:

```javascript
const { data, isLoading } = useUser()
const updateProfile = useUpdateProfile()
```

### 🎨 Ant Design Components
Professional UI out of the box:
- Cards, Tables, Forms
- Modals, Notifications
- Layouts, Menus
- And much more!

### 🔐 Supabase Auth
Secure authentication with:
- Email/password login
- Social auth ready
- Row-level security
- JWT tokens

### 📱 Responsive Layout
- Mobile-friendly sidebar
- Adaptive grid layouts
- Touch-optimized

## Project Structure

```
app/
  ├── (auth)/          # Login, Signup
  ├── (dashboard)/     # Protected pages
  └── providers.js     # React Query + Ant Design

components/
  ├── layouts/         # Dashboard layout
  ├── shared/          # Reusable components
  ├── dashboard/       # Dashboard components
  ├── billing/         # Billing components
  └── profile/         # Profile components

lib/
  ├── api/             # API functions
  ├── hooks/           # React Query hooks
  ├── supabase/        # Supabase clients
  └── utils/           # Helper functions
```

## Next Steps

📚 Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup  
📖 Check [README.md](./README.md) for full documentation  
🚀 Start customizing for your needs!

## Common Tasks

### Add a New Page

1. Create file in `app/(dashboard)/yourpage/page.js`
2. Add to sidebar in `components/layouts/DashboardSider.js`

### Create a New Component

```javascript
// components/shared/MyComponent.js
export default function MyComponent({ prop1, prop2 }) {
  return <div>Your component</div>
}
```

### Add a Query Hook

```javascript
// lib/hooks/queries/useMyData.js
import { useQuery } from '@tanstack/react-query'

export const useMyData = () => {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      // fetch your data
    },
  })
}
```

### Style with Tailwind

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Hello</h1>
</div>
```

## Tips

💡 Use React Query DevTools in development (bottom-left corner)  
💡 Check browser console for errors  
💡 Supabase has excellent docs: [supabase.com/docs](https://supabase.com/docs)  
💡 Hot reload works - save and see changes instantly  

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add your environment variables in the Vercel dashboard.

### Other Options
- Netlify
- AWS Amplify
- Docker/Self-hosted

## Need Help?

- 📚 Check the full [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 🐛 Look for errors in browser console
- 🔍 Search the code for examples
- 📧 Open an issue on GitHub

Happy coding! 🎉
