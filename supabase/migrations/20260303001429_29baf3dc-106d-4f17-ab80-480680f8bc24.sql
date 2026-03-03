
-- Fix the SECURITY DEFINER view issue by recreating with SECURITY INVOKER
CREATE OR REPLACE VIEW public.farmers_public 
WITH (security_invoker = true) AS
SELECT 
  id, name, location, latitude, longitude, rating, 
  products_count, total_sales, status, image_url, description,
  created_at, updated_at
FROM public.farmers;
