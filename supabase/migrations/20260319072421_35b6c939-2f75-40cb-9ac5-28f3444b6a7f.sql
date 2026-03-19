
-- Fix 2: Drop and recreate farmers_public view without sensitive columns
DROP VIEW IF EXISTS public.farmers_public;

CREATE VIEW public.farmers_public AS
SELECT 
  id,
  name,
  description,
  location,
  image_url,
  rating,
  products_count,
  status,
  created_at,
  updated_at
FROM farmers
WHERE status = 'active'::farmer_status;

-- Grant appropriate access
GRANT SELECT ON public.farmers_public TO anon, authenticated;
