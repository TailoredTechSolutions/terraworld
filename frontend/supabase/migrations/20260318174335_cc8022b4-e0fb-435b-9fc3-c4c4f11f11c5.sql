
-- ═══════════════════════════════════════════════
-- PHASE 4: Commission Engine Tables
-- ═══════════════════════════════════════════════

-- 1. Commission Runs
CREATE TABLE IF NOT EXISTS public.commission_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code text NOT NULL UNIQUE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  run_type text NOT NULL DEFAULT 'daily',
  status text NOT NULL DEFAULT 'draft',

  total_terra_fee numeric(18,2) NOT NULL DEFAULT 0,
  compensation_pool numeric(18,2) NOT NULL DEFAULT 0,

  direct_product_bonus_total numeric(18,2) NOT NULL DEFAULT 0,
  direct_membership_bonus_total numeric(18,2) NOT NULL DEFAULT 0,

  membership_binary_required numeric(18,2) NOT NULL DEFAULT 0,
  membership_payout_ratio numeric(12,6) NOT NULL DEFAULT 0,
  base_cycle_value numeric(18,2) NOT NULL DEFAULT 50.00,
  adjusted_cycle_value numeric(18,2) NOT NULL DEFAULT 50.00,
  fail_safe_triggered boolean NOT NULL DEFAULT false,

  binary_before_caps_total numeric(18,2) NOT NULL DEFAULT 0,
  binary_after_caps_total numeric(18,2) NOT NULL DEFAULT 0,
  matching_total numeric(18,2) NOT NULL DEFAULT 0,

  notes text,
  initiated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE public.commission_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage commission_runs" ON public.commission_runs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view commission_runs" ON public.commission_runs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 2. Commission Lines (one per member per run)
CREATE TABLE IF NOT EXISTS public.commission_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.commission_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,

  left_product_bv integer NOT NULL DEFAULT 0,
  right_product_bv integer NOT NULL DEFAULT 0,
  left_membership_bv integer NOT NULL DEFAULT 0,
  right_membership_bv integer NOT NULL DEFAULT 0,

  matched_product_bv integer NOT NULL DEFAULT 0,
  matched_membership_bv integer NOT NULL DEFAULT 0,

  binary_product_paid numeric(18,2) NOT NULL DEFAULT 0,
  binary_membership_paid numeric(18,2) NOT NULL DEFAULT 0,
  binary_total_before_cap numeric(18,2) NOT NULL DEFAULT 0,
  binary_cap_limit numeric(18,2) NOT NULL DEFAULT 0,
  binary_cap_applied numeric(18,2) NOT NULL DEFAULT 0,
  binary_total_paid numeric(18,2) NOT NULL DEFAULT 0,

  carry_left_product_bv integer NOT NULL DEFAULT 0,
  carry_right_product_bv integer NOT NULL DEFAULT 0,
  carry_left_membership_bv integer NOT NULL DEFAULT 0,
  carry_right_membership_bv integer NOT NULL DEFAULT 0,

  qualification_passed boolean NOT NULL DEFAULT false,
  statement_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (run_id, user_id)
);
ALTER TABLE public.commission_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage commission_lines" ON public.commission_lines FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view commission_lines" ON public.commission_lines FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own commission_lines" ON public.commission_lines FOR SELECT USING (auth.uid() = user_id);

-- Immutable
CREATE TRIGGER prevent_commission_lines_mutation
  BEFORE UPDATE OR DELETE ON public.commission_lines
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 3. Direct Bonus Lines
CREATE TABLE IF NOT EXISTS public.direct_bonus_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.commission_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('product','membership')),
  source_id uuid,
  base_amount numeric(18,2) NOT NULL,
  rate numeric(5,2) NOT NULL,
  bonus_paid numeric(18,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.direct_bonus_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage direct_bonus_lines" ON public.direct_bonus_lines FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view direct_bonus_lines" ON public.direct_bonus_lines FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own direct_bonus_lines" ON public.direct_bonus_lines FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER prevent_direct_bonus_lines_mutation
  BEFORE UPDATE OR DELETE ON public.direct_bonus_lines
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 4. Matching Lines
CREATE TABLE IF NOT EXISTS public.matching_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.commission_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  downline_user_id uuid NOT NULL,
  level_no integer NOT NULL,
  downline_binary_paid numeric(18,2) NOT NULL,
  matching_rate numeric(5,2) NOT NULL,
  matching_paid numeric(18,2) NOT NULL,
  qualification_passed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.matching_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage matching_lines" ON public.matching_lines FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view matching_lines" ON public.matching_lines FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own matching_lines" ON public.matching_lines FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER prevent_matching_lines_mutation
  BEFORE UPDATE OR DELETE ON public.matching_lines
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 5. Carry Forward Ledger
CREATE TABLE IF NOT EXISTS public.carry_forward_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.commission_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,

  left_product_bv_before integer NOT NULL DEFAULT 0,
  right_product_bv_before integer NOT NULL DEFAULT 0,
  left_membership_bv_before integer NOT NULL DEFAULT 0,
  right_membership_bv_before integer NOT NULL DEFAULT 0,

  matched_product_bv integer NOT NULL DEFAULT 0,
  matched_membership_bv integer NOT NULL DEFAULT 0,

  left_product_bv_after integer NOT NULL DEFAULT 0,
  right_product_bv_after integer NOT NULL DEFAULT 0,
  left_membership_bv_after integer NOT NULL DEFAULT 0,
  right_membership_bv_after integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.carry_forward_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage carry_forward_ledger" ON public.carry_forward_ledger FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view carry_forward_ledger" ON public.carry_forward_ledger FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own carry_forward_ledger" ON public.carry_forward_ledger FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER prevent_carry_forward_ledger_mutation
  BEFORE UPDATE OR DELETE ON public.carry_forward_ledger
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 6. BV Expiry Events
CREATE TABLE IF NOT EXISTS public.bv_expiry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  volume_id uuid NOT NULL REFERENCES public.volumes(id),
  expired_bv integer NOT NULL,
  bv_type text NOT NULL CHECK (bv_type IN ('product','membership')),
  leg_side text NOT NULL CHECK (leg_side IN ('left','right')),
  expired_at timestamptz NOT NULL DEFAULT now(),
  reason text
);
ALTER TABLE public.bv_expiry_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage bv_expiry_events" ON public.bv_expiry_events FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view bv_expiry_events" ON public.bv_expiry_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own bv_expiry_events" ON public.bv_expiry_events FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER prevent_bv_expiry_events_mutation
  BEFORE UPDATE OR DELETE ON public.bv_expiry_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 7. Commission Statements
CREATE TABLE IF NOT EXISTS public.commission_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.commission_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  statement_period_start timestamptz NOT NULL,
  statement_period_end timestamptz NOT NULL,
  statement_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, user_id)
);
ALTER TABLE public.commission_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage commission_statements" ON public.commission_statements FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view commission_statements" ON public.commission_statements FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own commission_statements" ON public.commission_statements FOR SELECT USING (auth.uid() = user_id);

-- 8. Payout Postings
CREATE TABLE IF NOT EXISTS public.payout_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.commission_runs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  posting_type text NOT NULL CHECK (posting_type IN ('direct_product','direct_membership','binary','matching')),
  source_line_id uuid,
  amount numeric(18,2) NOT NULL,
  posting_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz
);
ALTER TABLE public.payout_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payout_postings" ON public.payout_postings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view payout_postings" ON public.payout_postings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users view own payout_postings" ON public.payout_postings FOR SELECT USING (auth.uid() = user_id);

-- 9. Commission Reversals
CREATE TABLE IF NOT EXISTS public.commission_reversals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_run_id uuid NOT NULL REFERENCES public.commission_runs(id),
  reversal_run_id uuid REFERENCES public.commission_runs(id),
  user_id uuid,
  reason text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commission_reversals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage commission_reversals" ON public.commission_reversals FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Readonly admins view commission_reversals" ON public.commission_reversals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

CREATE TRIGGER prevent_commission_reversals_mutation
  BEFORE UPDATE OR DELETE ON public.commission_reversals
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- Seed Phase 4 permissions
INSERT INTO public.permissions (key, label, category) VALUES
  ('commissions.run', 'Run Commission Cycles', 'commissions'),
  ('commissions.reverse', 'Reverse Commissions', 'commissions'),
  ('commissions.statements.view', 'View Commission Statements', 'commissions'),
  ('direct_bonuses.view', 'View Direct Bonuses', 'commissions'),
  ('binary.caps.manage', 'Manage Binary Caps', 'commissions'),
  ('matching.view', 'View Matching Bonuses', 'commissions'),
  ('failsafe.manage', 'Manage Fail-Safe', 'commissions'),
  ('carryforward.view', 'View Carry Forward', 'commissions'),
  ('expiry.view', 'View BV Expiry', 'commissions'),
  ('payout_postings.view', 'View Payout Postings', 'commissions'),
  ('payout_postings.post', 'Post Payouts', 'commissions')
ON CONFLICT (key) DO NOTHING;
