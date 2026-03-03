-- Deny direct UPDATE on member_transfers (immutability trigger is backup)
CREATE POLICY "Transfers cannot be updated directly"
ON public.member_transfers FOR UPDATE
USING (false);

-- Deny DELETE on member_transfers
CREATE POLICY "Transfers cannot be deleted"
ON public.member_transfers FOR DELETE
USING (false);