
-- ═══════════════════════════════════════════════
-- PHASE 3: MLM Foundation Tables
-- ═══════════════════════════════════════════════

-- 1. MLM Packages (configurable package catalog)
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  price numeric(18,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  bv integer NOT NULL DEFAULT 0,
  pv integer NOT NULL DEFAULT 0,
  binary_rate numeric(5,2) NOT NULL DEFAULT 10.00,
  matching_levels integer NOT NULL DEFAULT 0,
  direct_product_bonus_rate numeric(5,2) NOT NULL DEFAULT 0,
  direct_membership_bonus_rate numeric(5,2) NOT NULL DEFAULT 0,
  binary_cap_daily numeric(18,2) NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage packages" ON public.packages FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view packages" ON public.packages FOR SELECT TO authenticated USING (true);

-- Seed exact package data from binary plan
INSERT INTO public.packages (code, name, price, bv, pv, binary_rate, matching_levels, direct_product_bonus_rate, direct_membership_bonus_rate, binary_cap_daily, is_free, sort_order) VALUES
  ('FREE',    'Free',    0,    0,    0, 10.00, 0, 15.00, 0.00,      0, true,  1),
  ('STARTER', 'Starter', 500,  500,  500, 10.00, 1, 18.00, 4.00,   5000, false, 2),
  ('BASIC',   'Basic',   1000, 1000, 1000, 10.00, 2, 20.00, 6.00, 15000, false, 3),
  ('PRO',     'Pro',     3000, 3000, 3000, 10.00, 3, 22.00, 8.00, 50000, false, 4),
  ('ELITE',   'Elite',   5000, 5000, 5000, 10.00, 5, 25.00,10.00,250000, false, 5)
ON CONFLICT (code) DO NOTHING;

-- 2. Member Status History (audit trail)
CREATE TABLE IF NOT EXISTS public.member_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_activation_status text,
  new_activation_status text,
  old_binary_status text,
  new_binary_status text,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage member_status_history" ON public.member_status_history FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view member_status_history" ON public.member_status_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own status history" ON public.member_status_history FOR SELECT USING (auth.uid() = user_id);

-- Immutable
CREATE TRIGGER prevent_member_status_history_mutation
  BEFORE UPDATE OR DELETE ON public.member_status_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 3. Member Package History
CREATE TABLE IF NOT EXISTS public.member_package_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.packages(id),
  action_type text NOT NULL,
  source_type text,
  source_id uuid,
  effective_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_package_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage member_package_history" ON public.member_package_history FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view member_package_history" ON public.member_package_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own package history" ON public.member_package_history FOR SELECT USING (auth.uid() = user_id);

-- Immutable
CREATE TRIGGER prevent_member_package_history_mutation
  BEFORE UPDATE OR DELETE ON public.member_package_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 4. Member Rank History
CREATE TABLE IF NOT EXISTS public.member_rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_rank_id uuid REFERENCES public.ranks(id),
  new_rank_id uuid REFERENCES public.ranks(id),
  change_type text NOT NULL,
  reason text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_rank_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage member_rank_history" ON public.member_rank_history FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view member_rank_history" ON public.member_rank_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own rank history" ON public.member_rank_history FOR SELECT USING (auth.uid() = user_id);

-- Immutable
CREATE TRIGGER prevent_member_rank_history_mutation
  BEFORE UPDATE OR DELETE ON public.member_rank_history
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 5. Activation Events
CREATE TABLE IF NOT EXISTS public.activation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.packages(id),
  amount_paid numeric(18,2) NOT NULL,
  payment_reference text,
  activation_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage activation_events" ON public.activation_events FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view activation_events" ON public.activation_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own activations" ON public.activation_events FOR SELECT USING (auth.uid() = user_id);

-- Immutable
CREATE TRIGGER prevent_activation_events_mutation
  BEFORE UPDATE OR DELETE ON public.activation_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 6. Placement Requests (auditable manual/auto placement)
CREATE TABLE IF NOT EXISTS public.placement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  proposed_parent_user_id uuid NOT NULL,
  proposed_side text NOT NULL CHECK (proposed_side IN ('left','right')),
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  requested_by uuid,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);
ALTER TABLE public.placement_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage placement_requests" ON public.placement_requests FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view placement_requests" ON public.placement_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 7. Volumes (detailed BV source tracking with left/right × product/membership)
CREATE TABLE IF NOT EXISTS public.volumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id uuid,
  origin_user_id uuid,
  beneficiary_user_id uuid NOT NULL,
  leg_side text NOT NULL CHECK (leg_side IN ('left','right')),
  bv_type text NOT NULL CHECK (bv_type IN ('product','membership')),
  bv_amount integer NOT NULL DEFAULT 0,
  pv_amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'posted',
  posted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE public.volumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage volumes" ON public.volumes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view volumes" ON public.volumes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own volumes" ON public.volumes FOR SELECT USING (auth.uid() = beneficiary_user_id OR auth.uid() = origin_user_id);

-- Immutable
CREATE TRIGGER prevent_volumes_mutation
  BEFORE UPDATE OR DELETE ON public.volumes
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 8. Volume Propagation (tracks how BV flows up the tree)
CREATE TABLE IF NOT EXISTS public.volume_propagation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id uuid NOT NULL REFERENCES public.volumes(id) ON DELETE CASCADE,
  from_user_id uuid,
  to_user_id uuid NOT NULL,
  leg_side text NOT NULL CHECK (leg_side IN ('left','right')),
  depth integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.volume_propagation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage volume_propagation" ON public.volume_propagation FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view volume_propagation" ON public.volume_propagation FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- Immutable
CREATE TRIGGER prevent_volume_propagation_mutation
  BEFORE UPDATE OR DELETE ON public.volume_propagation
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 9. Volume Balances Daily (fast dashboard summaries)
CREATE TABLE IF NOT EXISTS public.volume_balances_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stat_date date NOT NULL,
  left_product_bv integer NOT NULL DEFAULT 0,
  right_product_bv integer NOT NULL DEFAULT 0,
  left_membership_bv integer NOT NULL DEFAULT 0,
  right_membership_bv integer NOT NULL DEFAULT 0,
  carry_left_bv integer NOT NULL DEFAULT 0,
  carry_right_bv integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, stat_date)
);
ALTER TABLE public.volume_balances_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage volume_balances_daily" ON public.volume_balances_daily FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view volume_balances_daily" ON public.volume_balances_daily FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own volume_balances_daily" ON public.volume_balances_daily FOR SELECT USING (auth.uid() = user_id);

-- 10. Genealogy Snapshots (tree caching for reports)
CREATE TABLE IF NOT EXISTS public.genealogy_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  snapshot_date date NOT NULL,
  left_count integer NOT NULL DEFAULT 0,
  right_count integer NOT NULL DEFAULT 0,
  left_active_count integer NOT NULL DEFAULT 0,
  right_active_count integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, snapshot_date)
);
ALTER TABLE public.genealogy_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage genealogy_snapshots" ON public.genealogy_snapshots FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view genealogy_snapshots" ON public.genealogy_snapshots FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 11. Rank Qualification Snapshots
CREATE TABLE IF NOT EXISTS public.rank_qualification_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rank_id uuid NOT NULL REFERENCES public.ranks(id),
  snapshot_date date NOT NULL,
  qualification_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_qualified boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, rank_id, snapshot_date)
);
ALTER TABLE public.rank_qualification_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage rank_qualification_snapshots" ON public.rank_qualification_snapshots FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view rank_qualification_snapshots" ON public.rank_qualification_snapshots FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own rank_qual_snapshots" ON public.rank_qualification_snapshots FOR SELECT USING (auth.uid() = user_id);

-- Seed Phase 3 MLM permissions
INSERT INTO public.permissions (key, label, category) VALUES
  ('members.activate', 'Activate Members', 'mlm'),
  ('members.suspend', 'Suspend Members', 'mlm'),
  ('genealogy.place', 'Place Members in Tree', 'mlm'),
  ('genealogy.lock.view', 'View Genealogy Locks', 'mlm'),
  ('packages.assign', 'Assign Packages', 'mlm'),
  ('volumes.adjust', 'Adjust Volumes', 'mlm'),
  ('volumes.reverse', 'Reverse Volumes', 'mlm'),
  ('ranks.override', 'Override Ranks', 'mlm'),
  ('mlm_reports.view', 'View MLM Reports', 'mlm'),
  ('mlm_reports.export', 'Export MLM Reports', 'mlm')
ON CONFLICT (key) DO NOTHING;
