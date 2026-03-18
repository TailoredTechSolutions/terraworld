
-- ═══════════════════════════════════════════════
-- BUSINESS CENTER: Missing Tables Migration
-- ═══════════════════════════════════════════════

-- 1. Approval Requests (dual approval for money edits)
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_by uuid NOT NULL,
  approved_by uuid,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage approval_requests" ON public.approval_requests FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view approval_requests" ON public.approval_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 2. Token Allocations (whitepaper buckets)
CREATE TABLE IF NOT EXISTS public.token_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_code text UNIQUE NOT NULL,
  bucket_name text NOT NULL,
  allocation_percent numeric(5,2) NOT NULL DEFAULT 0,
  allocation_amount numeric(24,8) NOT NULL DEFAULT 0,
  released_amount numeric(24,8) NOT NULL DEFAULT 0,
  distributed_amount numeric(24,8) NOT NULL DEFAULT 0,
  remaining_amount numeric(24,8) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.token_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage token_allocations" ON public.token_allocations FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view token_allocations" ON public.token_allocations FOR SELECT TO authenticated USING (true);

-- 3. Token Market Snapshots
CREATE TABLE IF NOT EXISTS public.token_market_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_php numeric(18,8) NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  captured_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.token_market_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage token_market_snapshots" ON public.token_market_snapshots FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view token_market_snapshots" ON public.token_market_snapshots FOR SELECT TO authenticated USING (true);

-- 4. Token Reward Rules
CREATE TABLE IF NOT EXISTS public.token_reward_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  basis_type text NOT NULL,
  reward_php numeric(18,2) NOT NULL DEFAULT 0,
  daily_cap numeric(18,2),
  qualification_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.token_reward_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage token_reward_rules" ON public.token_reward_rules FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view token_reward_rules" ON public.token_reward_rules FOR SELECT TO authenticated USING (true);

-- 5. Token Issuances
CREATE TABLE IF NOT EXISTS public.token_issuances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid NOT NULL,
  rule_id uuid REFERENCES public.token_reward_rules(id),
  bucket_id uuid REFERENCES public.token_allocations(id),
  reward_php numeric(18,2) NOT NULL,
  token_price_php numeric(18,8) NOT NULL,
  tokens_issued numeric(24,8) NOT NULL,
  reference_type text,
  reference_id uuid,
  issued_by uuid,
  issued_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.token_issuances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage token_issuances" ON public.token_issuances FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own token_issuances" ON public.token_issuances FOR SELECT USING (auth.uid() = recipient_user_id);

-- 6. Token Burn Events
CREATE TABLE IF NOT EXISTS public.token_burn_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  reference_id uuid,
  tokens_burned numeric(24,8) NOT NULL,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.token_burn_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage token_burn_events" ON public.token_burn_events FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view token_burn_events" ON public.token_burn_events FOR SELECT TO authenticated USING (true);

-- 7. Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  ticket_id uuid REFERENCES public.support_tickets(id),
  type text NOT NULL DEFAULT 'general',
  resolution_status text NOT NULL DEFAULT 'open',
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage disputes" ON public.disputes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view disputes" ON public.disputes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 8. Promotion Campaigns
CREATE TABLE IF NOT EXISTS public.promotion_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  kpi_target jsonb DEFAULT '{}'::jsonb,
  config jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promotion_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage promotion_campaigns" ON public.promotion_campaigns FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view promotion_campaigns" ON public.promotion_campaigns FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- Immutability triggers on token_issuances and token_burn_events
CREATE TRIGGER prevent_token_issuances_mutation
  BEFORE UPDATE OR DELETE ON public.token_issuances
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

CREATE TRIGGER prevent_token_burn_events_mutation
  BEFORE UPDATE OR DELETE ON public.token_burn_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- Seed expanded permissions for Business Center modules
INSERT INTO public.permissions (key, label, category) VALUES
  ('overview.view', 'View Overview', 'overview'),
  ('users.view', 'View Users', 'users'),
  ('users.edit', 'Edit Users', 'users'),
  ('users.suspend', 'Suspend Users', 'users'),
  ('users.roles.assign', 'Assign Roles', 'users'),
  ('farmers.view', 'View Farmers', 'marketplace'),
  ('farmers.manage', 'Manage Farmers', 'marketplace'),
  ('buyers.view', 'View Buyers', 'marketplace'),
  ('buyers.manage', 'Manage Buyers', 'marketplace'),
  ('drivers.view', 'View Drivers', 'marketplace'),
  ('drivers.manage', 'Manage Drivers', 'marketplace'),
  ('products.approve', 'Approve Products', 'marketplace'),
  ('products.manage', 'Manage Products', 'marketplace'),
  ('orders.view', 'View Orders', 'marketplace'),
  ('orders.manage', 'Manage Orders', 'marketplace'),
  ('pricing.manage', 'Manage Pricing', 'marketplace'),
  ('payments.reconcile', 'Reconcile Payments', 'marketplace'),
  ('deliveries.view', 'View Deliveries', 'logistics'),
  ('deliveries.manage', 'Manage Deliveries', 'logistics'),
  ('drivers.assign', 'Assign Drivers', 'logistics'),
  ('routes.manage', 'Manage Routes', 'logistics'),
  ('members.view', 'View Members', 'mlm'),
  ('members.manage', 'Manage Members', 'mlm'),
  ('genealogy.view', 'View Genealogy', 'mlm'),
  ('genealogy.override', 'Override Placement', 'mlm'),
  ('packages.view', 'View Packages', 'mlm'),
  ('packages.manage', 'Manage Packages', 'mlm'),
  ('volumes.view', 'View Volumes', 'mlm'),
  ('commissions.run', 'Run Commissions', 'mlm'),
  ('commissions.view', 'View Commissions', 'mlm'),
  ('matching.view', 'View Matching', 'mlm'),
  ('ranks.view', 'View Ranks', 'mlm'),
  ('ranks.manage', 'Manage Ranks', 'mlm'),
  ('failsafe.view', 'View Fail-safe', 'mlm'),
  ('failsafe.manage', 'Manage Fail-safe', 'mlm'),
  ('wallets.view', 'View Wallets', 'wallets'),
  ('wallets.adjust.request', 'Request Wallet Adjustment', 'wallets'),
  ('wallets.adjust.approve', 'Approve Wallet Adjustment', 'wallets'),
  ('ledger.view', 'View Ledger', 'wallets'),
  ('withdrawals.view', 'View Withdrawals', 'withdrawals'),
  ('withdrawals.approve', 'Approve Withdrawals', 'withdrawals'),
  ('withdrawals.pay', 'Mark Withdrawals Paid', 'withdrawals'),
  ('withdrawals.close', 'Close Withdrawals', 'withdrawals'),
  ('tokenomics.view', 'View Tokenomics', 'tokenomics'),
  ('token_allocations.manage', 'Manage Token Allocations', 'tokenomics'),
  ('token_rewards.issue', 'Issue Token Rewards', 'tokenomics'),
  ('token_burns.view', 'View Token Burns', 'tokenomics'),
  ('token_burns.manage', 'Manage Token Burns', 'tokenomics'),
  ('coupons.view', 'View Coupons', 'coupons'),
  ('coupons.manage', 'Manage Coupons', 'coupons'),
  ('campaigns.view', 'View Campaigns', 'coupons'),
  ('campaigns.manage', 'Manage Campaigns', 'coupons'),
  ('tickets.view', 'View Support Tickets', 'support'),
  ('tickets.manage', 'Manage Support Tickets', 'support'),
  ('disputes.manage', 'Manage Disputes', 'support'),
  ('refunds.manage', 'Manage Refunds', 'support'),
  ('reports.view', 'View Reports', 'reporting'),
  ('reports.export', 'Export Reports', 'reporting'),
  ('audit.view', 'View Audit Logs', 'compliance'),
  ('approvals.view', 'View Approvals', 'compliance'),
  ('approvals.act', 'Act on Approvals', 'compliance'),
  ('kyc.review', 'Review KYC', 'compliance'),
  ('settings.manage', 'Manage Settings', 'compliance')
ON CONFLICT (key) DO NOTHING;
