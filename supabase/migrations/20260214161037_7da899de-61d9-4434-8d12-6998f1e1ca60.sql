
-- Fix overly permissive INSERT policy on audit_log
DROP POLICY IF EXISTS "Backend can insert audit log" ON public.audit_log;

-- Only service role (edge functions) can insert audit entries
-- Regular users cannot insert audit logs
CREATE POLICY "Service role inserts audit log" ON public.audit_log
  FOR INSERT WITH CHECK (false);
