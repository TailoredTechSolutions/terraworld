-- Fix 1: Add self-check guard to has_role to prevent cross-user role enumeration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND _user_id = auth.uid()
  );
$$;

-- Fix 2: Add user-scoped SELECT policy on genealogy_snapshots
CREATE POLICY "Users can view own genealogy snapshots"
ON public.genealogy_snapshots
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);