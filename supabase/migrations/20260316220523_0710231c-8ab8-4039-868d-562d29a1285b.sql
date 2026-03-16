-- Re-add the anon block on the base farmers table to protect PII (email, phone, owner)
CREATE POLICY "Anon blocked from farmers table"
  ON public.farmers
  FOR SELECT
  TO anon
  USING (false);

-- Grant SELECT on the view to anon and authenticated so PostgREST can serve it
GRANT SELECT ON public.farmers_public TO anon, authenticated;