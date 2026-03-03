
-- Fix 1: Restrict platform_settings - replace open SELECT with selective public access
DROP POLICY IF EXISTS "Anyone can read settings" ON public.platform_settings;

-- Only allow public access to non-sensitive settings
CREATE POLICY "Public can view allowed settings" ON public.platform_settings
  FOR SELECT USING (
    setting_key IN ('terra_fee_percent', 'tax_rate_percent', 'token_market_price')
  );

-- Admins can still view all settings (already exists via ALL policy, but add explicit SELECT for clarity)
CREATE POLICY "Authenticated users view basic settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (
    setting_key NOT IN ('google_maps_api_key')
  );

-- Fix 2: Create a public view for farmers that excludes sensitive contact info
CREATE OR REPLACE VIEW public.farmers_public AS
SELECT 
  id, name, location, latitude, longitude, rating, 
  products_count, total_sales, status, image_url, description,
  created_at, updated_at
FROM public.farmers;

-- Grant access to the public view
GRANT SELECT ON public.farmers_public TO anon, authenticated;

-- Restrict the farmers table public SELECT to exclude email/phone
-- Drop the overly permissive "Anyone can view farmers" policy
DROP POLICY IF EXISTS "Anyone can view farmers" ON public.farmers;

-- Replace with authenticated-only access for full farmer data
CREATE POLICY "Authenticated can view farmer basics" ON public.farmers
  FOR SELECT TO authenticated USING (true);

-- Anon users get no direct table access (they use farmers_public view)
