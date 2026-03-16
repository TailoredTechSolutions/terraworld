
-- ============================================================
-- FIX 5: Remove broad authenticated access to farmers table
-- Only farmers viewing their own record and admins should
-- have direct access. All other users use farmers_public view.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated can view active farmers" ON public.farmers;

-- ============================================================
-- FIX 6: Prevent profile email hijack (privilege escalation)
-- Add WITH CHECK to profiles UPDATE policy to prevent users
-- from changing their email column.
-- ============================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
