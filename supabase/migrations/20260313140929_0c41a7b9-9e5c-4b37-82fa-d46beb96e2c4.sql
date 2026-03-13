
-- The farmers_public view with security_invoker will use the caller's permissions.
-- Since the underlying farmers table already has RLS, we need a public SELECT policy
-- on farmers for unauthenticated marketplace browsing.
-- Check if one exists already - the existing "Farmers can view own record" is scoped to owner only.
-- Add a public read policy for non-sensitive fields via the view.
CREATE POLICY "Public can view active farmers via view"
ON public.farmers FOR SELECT
TO anon, authenticated
USING (status = 'active');
