-- Recreate the view WITHOUT security_invoker so it runs as definer (owner)
-- This way anon can read the view but not the base table directly
DROP VIEW IF EXISTS public.farmers_public;

CREATE VIEW public.farmers_public AS
  SELECT id, name, description, location, image_url, latitude, longitude,
         rating, products_count, total_sales, status, created_at, updated_at
  FROM public.farmers;

-- Now restrict the base table again - only allow through specific policies
DROP POLICY IF EXISTS "Public can read farmers" ON public.farmers;