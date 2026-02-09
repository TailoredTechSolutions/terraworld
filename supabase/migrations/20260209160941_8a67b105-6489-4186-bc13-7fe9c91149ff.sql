
-- Remove existing permissive policies on drivers table
DROP POLICY IF EXISTS "Drivers are viewable by everyone" ON public.drivers;
DROP POLICY IF EXISTS "Drivers update denied until auth implemented" ON public.drivers;
DROP POLICY IF EXISTS "Drivers created via backend only" ON public.drivers;

-- Admin-only access for all operations
CREATE POLICY "Admins can manage drivers"
ON public.drivers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
