-- Drop the restrictive "Authenticated users can view farmers" policy and replace with permissive
DROP POLICY IF EXISTS "Authenticated users can view farmers" ON farmers;

-- Add a permissive SELECT policy so everyone (including anonymous) can view farm listings
CREATE POLICY "Anyone can view farmers"
  ON farmers FOR SELECT
  USING (true);
