-- Recreate farmers_public view to only expose active farmers
CREATE OR REPLACE VIEW public.farmers_public
WITH (security_invoker = off)
AS
SELECT
  id,
  name,
  description,
  location,
  image_url,
  latitude,
  longitude,
  rating,
  products_count,
  total_sales,
  status,
  created_at,
  updated_at
FROM farmers
WHERE status = 'active';