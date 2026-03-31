-- Recreate the farmers_public view WITHOUT security_invoker
-- so anonymous/public users can read non-PII farmer data
DROP VIEW IF EXISTS public.farmers_public;

CREATE VIEW public.farmers_public AS
  SELECT id, name, location, latitude, longitude, rating,
         products_count, total_sales, status, image_url,
         description, created_at, updated_at
  FROM public.farmers;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.farmers_public TO anon, authenticated;