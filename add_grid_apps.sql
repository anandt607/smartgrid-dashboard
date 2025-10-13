-- Add TeamGrid, BrandGrid, CallGrid, and SalesGrid apps
INSERT INTO public.apps (name, description, icon, url, requires_subscription, category, status) VALUES
  ('TeamGrid', 'Manage your team members and collaborations', '👥', 'https://teamgrid.example.com', false, 'Team Management', 'active'),
  ('BrandGrid', 'Build and manage your brand identity', '🎨', 'https://brandgrid.example.com', true, 'Branding', 'active'),
  ('CallGrid', 'Make and track calls with your customers', '📞', 'https://callgrid.example.com', true, 'Communication', 'active'),
  ('SalesGrid', 'Track sales and revenue analytics', '💰', 'https://salesgrid.example.com', true, 'Sales', 'active');
