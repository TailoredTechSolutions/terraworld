-- Drop the blanket block policy that prevents anon from reading farmers
DROP POLICY IF EXISTS "Anon blocked from farmers table" ON public.farmers;

-- Allow anyone (including anon) to SELECT from farmers so the farmers_public view works
-- The farmers_public view already limits which columns are exposed (no email, phone, owner)
CREATE POLICY "Public can read farmers"
  ON public.farmers
  FOR SELECT
  TO anon, authenticated
  USING (true);