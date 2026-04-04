-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Drivers can view own record" ON public.drivers;
DROP POLICY IF EXISTS "Read-only admins can view drivers" ON public.drivers;

-- Create a single SELECT policy that properly restricts access
CREATE POLICY "Drivers can view own record or admin"
ON public.drivers
FOR SELECT
TO authenticated
USING (
  email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'admin_readonly'::app_role)
);