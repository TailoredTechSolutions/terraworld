-- Re-grant EXECUTE on has_role to authenticated users.
-- This is needed because RLS policies on user_roles, profiles, and other tables
-- call has_role() in their policy expressions. The function is SECURITY DEFINER
-- so it safely bypasses RLS on user_roles itself, but callers need EXECUTE permission.
-- We keep the revoke from anon and public for security.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;