
-- ═══════════════════════════════════════════════
-- PHASE 5: Wallets, Withdrawals & Treasury Control
-- ═══════════════════════════════════════════════

-- 1. Wallet Adjustment Requests (dual approval)
CREATE TABLE IF NOT EXISTS public.wallet_adjustment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id),
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('credit','debit','reserve','release')),
  asset_type text NOT NULL DEFAULT 'php',
  amount numeric(24,8) NOT NULL,
  reason text NOT NULL,
  reference_type text,
  reference_id uuid,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL,
  first_approved_by uuid,
  final_approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  first_approved_at timestamptz,
  final_approved_at timestamptz,
  applied_at timestamptz
);
ALTER TABLE public.wallet_adjustment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage wallet_adjustment_requests" ON public.wallet_adjustment_requests FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view wallet_adjustment_requests" ON public.wallet_adjustment_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 2. Ledger Reversals
CREATE TABLE IF NOT EXISTS public.ledger_reversals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_entry_id uuid NOT NULL,
  reversal_entry_id uuid,
  reason text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ledger_reversals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ledger_reversals" ON public.ledger_reversals FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view ledger_reversals" ON public.ledger_reversals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

CREATE TRIGGER prevent_ledger_reversals_mutation
  BEFORE UPDATE OR DELETE ON public.ledger_reversals
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 3. Withdrawal Status History
CREATE TABLE IF NOT EXISTS public.withdrawal_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawal_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage withdrawal_status_history" ON public.withdrawal_status_history FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view withdrawal_status_history" ON public.withdrawal_status_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

CREATE TRIGGER prevent_withdrawal_status_history_mutation
  BEFORE UPDATE OR DELETE ON public.withdrawal_status_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 4. Withdrawal Batches
CREATE TABLE IF NOT EXISTS public.withdrawal_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code text NOT NULL UNIQUE,
  method text NOT NULL,
  item_count integer NOT NULL DEFAULT 0,
  gross_amount numeric(18,2) NOT NULL DEFAULT 0,
  fee_amount numeric(18,2) NOT NULL DEFAULT 0,
  net_amount numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  completed_at timestamptz
);
ALTER TABLE public.withdrawal_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage withdrawal_batches" ON public.withdrawal_batches FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view withdrawal_batches" ON public.withdrawal_batches FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 5. Withdrawal Batch Items
CREATE TABLE IF NOT EXISTS public.withdrawal_batch_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.withdrawal_batches(id) ON DELETE CASCADE,
  withdrawal_id uuid NOT NULL,
  UNIQUE(batch_id, withdrawal_id)
);
ALTER TABLE public.withdrawal_batch_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage withdrawal_batch_items" ON public.withdrawal_batch_items FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 6. Treasury Accounts
CREATE TABLE IF NOT EXISTS public.treasury_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  treasury_type text NOT NULL,
  asset_type text NOT NULL DEFAULT 'php',
  current_balance numeric(24,8) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.treasury_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage treasury_accounts" ON public.treasury_accounts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view treasury_accounts" ON public.treasury_accounts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 7. Treasury Movements
CREATE TABLE IF NOT EXISTS public.treasury_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treasury_account_id uuid NOT NULL REFERENCES public.treasury_accounts(id),
  movement_type text NOT NULL,
  asset_type text NOT NULL DEFAULT 'php',
  amount numeric(24,8) NOT NULL,
  reason_code text NOT NULL,
  reference_type text,
  reference_id uuid,
  approved_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.treasury_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage treasury_movements" ON public.treasury_movements FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view treasury_movements" ON public.treasury_movements FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

CREATE TRIGGER prevent_treasury_movements_mutation
  BEFORE UPDATE OR DELETE ON public.treasury_movements
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 8. Treasury Release Requests
CREATE TABLE IF NOT EXISTS public.treasury_release_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treasury_account_id uuid NOT NULL REFERENCES public.treasury_accounts(id),
  requested_amount numeric(24,8) NOT NULL,
  asset_type text NOT NULL DEFAULT 'php',
  purpose text NOT NULL,
  governance_mode text NOT NULL DEFAULT 'multisig',
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid,
  approved_by uuid,
  released_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  released_at timestamptz
);
ALTER TABLE public.treasury_release_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage treasury_release_requests" ON public.treasury_release_requests FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view treasury_release_requests" ON public.treasury_release_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 9. Burn Events
CREATE TABLE IF NOT EXISTS public.burn_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_reference text,
  treasury_account_id uuid REFERENCES public.treasury_accounts(id),
  token_amount numeric(24,8) NOT NULL,
  tx_hash text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.burn_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage burn_events" ON public.burn_events FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view burn_events" ON public.burn_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

CREATE TRIGGER prevent_burn_events_mutation
  BEFORE UPDATE OR DELETE ON public.burn_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 10. Settlement Cycles
CREATE TABLE IF NOT EXISTS public.settlement_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_code text NOT NULL UNIQUE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  gross_settlement_php numeric(18,2) NOT NULL DEFAULT 0,
  logistics_settlement_php numeric(18,2) NOT NULL DEFAULT 0,
  merchant_settlement_php numeric(18,2) NOT NULL DEFAULT 0,
  treasury_allocation_php numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
ALTER TABLE public.settlement_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settlement_cycles" ON public.settlement_cycles FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view settlement_cycles" ON public.settlement_cycles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- Seed treasury accounts per tokenomics whitepaper
INSERT INTO public.treasury_accounts (code, name, treasury_type, asset_type) VALUES
  ('CASH_RESERVE', 'Cash Reserve', 'cash_reserve', 'php'),
  ('DAO_RESERVE', 'Treasury / DAO Reserve', 'dao_reserve', 'token'),
  ('REWARD_RESERVE', 'Network Rewards & Compensation', 'reward_reserve', 'token'),
  ('FARMER_REWARDS', 'Farmer Rewards & Produce Incentives', 'reward_reserve', 'token'),
  ('ECOSYSTEM_LIQUIDITY', 'Ecosystem & Utility Liquidity', 'reward_reserve', 'token'),
  ('MARKETING_AIRDROPS', 'Marketing / Airdrops / Adoption', 'reward_reserve', 'token'),
  ('SETTLEMENT_POOL', 'Settlement Pool', 'settlement_pool', 'php'),
  ('BURN_POOL', 'Burn Pool', 'burn_pool', 'token')
ON CONFLICT (code) DO NOTHING;

-- Seed Phase 5 permissions
INSERT INTO public.permissions (key, label, category) VALUES
  ('wallets.adjust.request', 'Request Wallet Adjustments', 'finance'),
  ('wallets.adjust.approve', 'Approve Wallet Adjustments', 'finance'),
  ('wallets.reverse', 'Reverse Ledger Entries', 'finance'),
  ('withdrawals.approve', 'Approve Withdrawals', 'finance'),
  ('withdrawals.pay', 'Process Withdrawal Payments', 'finance'),
  ('withdrawals.close', 'Close Withdrawals', 'finance'),
  ('withdrawals.batch.manage', 'Manage Withdrawal Batches', 'finance'),
  ('treasury.view', 'View Treasury', 'treasury'),
  ('treasury.move', 'Create Treasury Movements', 'treasury'),
  ('treasury.release.request', 'Request Treasury Release', 'treasury'),
  ('treasury.release.approve', 'Approve Treasury Release', 'treasury'),
  ('treasury.burn.manage', 'Manage Token Burns', 'treasury'),
  ('treasury.settlement.manage', 'Manage Settlements', 'treasury'),
  ('token_reserves.view', 'View Token Reserves', 'treasury'),
  ('token_reserves.manage', 'Manage Token Reserves', 'treasury')
ON CONFLICT (key) DO NOTHING;
