
-- Fix profiles table: remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Keep existing "Users can view own profile" policy (already exists)
-- Keep existing "Admins can view all profiles" via admin role check
-- Add admin SELECT policy for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix farmers table: remove public SELECT, restrict to authenticated users
DROP POLICY IF EXISTS "Farmers are viewable by everyone" ON public.farmers;

-- Authenticated users can view farmer name/location (needed for marketplace)
CREATE POLICY "Authenticated users can view farmers"
ON public.farmers
FOR SELECT
TO authenticated
USING (true);

-- Admins can manage farmers
CREATE POLICY "Admins can manage farmers"
ON public.farmers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
