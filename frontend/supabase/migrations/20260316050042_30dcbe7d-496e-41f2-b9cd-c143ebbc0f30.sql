
-- FIX 9: Lock profiles INSERT email to match auth email
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- FIX 10: farmers_public view - it's a view so we can't enable RLS on it directly.
-- The security_invoker=on setting already applied means it inherits the
-- base table's RLS. The warning is a false positive since views with
-- security_invoker respect the underlying farmers table policies.
-- We'll mark this as accepted.
