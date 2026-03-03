
-- Fix 1: Restrict farmer PII - remove permissive authenticated policy
DROP POLICY IF EXISTS "Authenticated can view farmer basics" ON public.farmers;

-- Only farmers can view their own full record (with email/phone)
CREATE POLICY "Farmers can view own record"
  ON public.farmers FOR SELECT TO authenticated
  USING (
    email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  );

-- Fix 2: member_transfers - the table already has RLS enabled and policies per the schema,
-- but let's ensure the INSERT policy allows sender-only inserts properly
-- First drop the overly restrictive false INSERT policy and replace with sender-scoped
DROP POLICY IF EXISTS "Transfers created via backend only" ON public.member_transfers;

CREATE POLICY "Users can create own transfers"
  ON public.member_transfers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Prevent modification of completed transfers
CREATE OR REPLACE FUNCTION public.prevent_transfer_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Cannot modify completed transfers';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_transfer_immutability
  BEFORE UPDATE ON public.member_transfers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_transfer_modification();
