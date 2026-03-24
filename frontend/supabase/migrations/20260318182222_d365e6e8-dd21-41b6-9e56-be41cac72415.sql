
-- Phase 7: Reports, Compliance, Audit & Admin Hardening

-- Tables
CREATE TABLE IF NOT EXISTS public.report_exports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), report_type TEXT NOT NULL, filter_payload JSONB NOT NULL DEFAULT '{}'::jsonb, file_format TEXT NOT NULL CHECK (file_format IN ('csv','pdf','xlsx')), status TEXT NOT NULL DEFAULT 'queued', file_url TEXT, requested_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ);
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.saved_report_views (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, report_type TEXT NOT NULL, name TEXT NOT NULL, filter_payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.saved_report_views ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.kyc_reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), profile_id UUID NOT NULL, review_status TEXT NOT NULL DEFAULT 'pending', reviewer_id UUID, notes TEXT, reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.kyc_reviews ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.country_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), country_code TEXT NOT NULL UNIQUE, is_allowed BOOLEAN NOT NULL DEFAULT true, kyc_required BOOLEAN NOT NULL DEFAULT false, withdrawals_allowed BOOLEAN NOT NULL DEFAULT true, notes TEXT, updated_by UUID, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.country_rules ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.placement_lock_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), member_id UUID NOT NULL, commission_run_id UUID REFERENCES public.commission_runs(id), lock_status TEXT NOT NULL, reason TEXT, changed_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.placement_lock_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.fraud_flags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id UUID, severity TEXT NOT NULL DEFAULT 'medium', rule_code TEXT, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', assigned_to UUID, created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), resolved_at TIMESTAMPTZ);
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.risk_reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), fraud_flag_id UUID NOT NULL REFERENCES public.fraud_flags(id) ON DELETE CASCADE, review_status TEXT NOT NULL DEFAULT 'pending', reviewer_id UUID, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), reviewed_at TIMESTAMPTZ);
ALTER TABLE public.risk_reviews ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.data_integrity_checks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), check_code TEXT NOT NULL, module TEXT NOT NULL, status TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}'::jsonb, executed_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.data_integrity_checks ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.feature_flags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), flag_code TEXT NOT NULL UNIQUE, flag_name TEXT NOT NULL, is_enabled BOOLEAN NOT NULL DEFAULT false, config JSONB NOT NULL DEFAULT '{}'::jsonb, updated_by UUID, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.security_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), setting_code TEXT NOT NULL UNIQUE, setting_value JSONB NOT NULL, updated_by UUID, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.admin_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), ended_at TIMESTAMPTZ, ip_address INET, user_agent TEXT, is_active BOOLEAN NOT NULL DEFAULT true);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.high_risk_actions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT NOT NULL, action_code TEXT NOT NULL, entity_type TEXT, entity_id UUID, requested_by UUID, approval_required BOOLEAN NOT NULL DEFAULT true, approved_by UUID, approval_status TEXT NOT NULL DEFAULT 'pending', reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), executed_at TIMESTAMPTZ);
ALTER TABLE public.high_risk_actions ENABLE ROW LEVEL SECURITY;

-- RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='report_exports' AND policyname='p7_re_sel') THEN CREATE POLICY "p7_re_sel" ON public.report_exports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR requested_by = auth.uid()); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='report_exports' AND policyname='p7_re_all') THEN CREATE POLICY "p7_re_all" ON public.report_exports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_report_views' AND policyname='p7_srv_sel') THEN CREATE POLICY "p7_srv_sel" ON public.saved_report_views FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_report_views' AND policyname='p7_srv_all') THEN CREATE POLICY "p7_srv_all" ON public.saved_report_views FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kyc_reviews' AND policyname='p7_kr_sel') THEN CREATE POLICY "p7_kr_sel" ON public.kyc_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kyc_reviews' AND policyname='p7_kr_all') THEN CREATE POLICY "p7_kr_all" ON public.kyc_reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='country_rules' AND policyname='p7_cr_sel') THEN CREATE POLICY "p7_cr_sel" ON public.country_rules FOR SELECT TO authenticated USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='country_rules' AND policyname='p7_cr_all') THEN CREATE POLICY "p7_cr_all" ON public.country_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='placement_lock_events' AND policyname='p7_ple_sel') THEN CREATE POLICY "p7_ple_sel" ON public.placement_lock_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='placement_lock_events' AND policyname='p7_ple_all') THEN CREATE POLICY "p7_ple_all" ON public.placement_lock_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fraud_flags' AND policyname='p7_ff_sel') THEN CREATE POLICY "p7_ff_sel" ON public.fraud_flags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fraud_flags' AND policyname='p7_ff_all') THEN CREATE POLICY "p7_ff_all" ON public.fraud_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='risk_reviews' AND policyname='p7_rr_sel') THEN CREATE POLICY "p7_rr_sel" ON public.risk_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='risk_reviews' AND policyname='p7_rr_all') THEN CREATE POLICY "p7_rr_all" ON public.risk_reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_integrity_checks' AND policyname='p7_dic_sel') THEN CREATE POLICY "p7_dic_sel" ON public.data_integrity_checks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_integrity_checks' AND policyname='p7_dic_all') THEN CREATE POLICY "p7_dic_all" ON public.data_integrity_checks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feature_flags' AND policyname='p7_ffg_sel') THEN CREATE POLICY "p7_ffg_sel" ON public.feature_flags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feature_flags' AND policyname='p7_ffg_all') THEN CREATE POLICY "p7_ffg_all" ON public.feature_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='security_settings' AND policyname='p7_ss_sel') THEN CREATE POLICY "p7_ss_sel" ON public.security_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='security_settings' AND policyname='p7_ss_all') THEN CREATE POLICY "p7_ss_all" ON public.security_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_sessions' AND policyname='p7_as_sel') THEN CREATE POLICY "p7_as_sel" ON public.admin_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_sessions' AND policyname='p7_as_all') THEN CREATE POLICY "p7_as_all" ON public.admin_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='high_risk_actions' AND policyname='p7_hra_sel') THEN CREATE POLICY "p7_hra_sel" ON public.high_risk_actions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='high_risk_actions' AND policyname='p7_hra_all') THEN CREATE POLICY "p7_hra_all" ON public.high_risk_actions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
END $$;

-- Reporting views (using correct column names)
CREATE OR REPLACE VIEW public.vw_sales_summary_daily AS
SELECT DATE(created_at) AS sale_date, COUNT(*) AS order_count, COALESCE(SUM(total),0) AS total_revenue, COALESCE(SUM(terra_fee),0) AS total_fees
FROM public.orders WHERE status NOT IN ('cancelled') GROUP BY DATE(created_at) ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW public.vw_activation_summary AS
SELECT DATE(created_at) AS activation_date, COUNT(*) AS activation_count, COALESCE(SUM(amount_paid),0) AS total_amount
FROM public.activation_events WHERE activation_status = 'completed' GROUP BY DATE(created_at) ORDER BY activation_date DESC;

CREATE OR REPLACE VIEW public.vw_bv_summary_daily AS
SELECT DATE(created_at) AS bv_date, bv_type, COALESCE(SUM(bv_amount),0) AS total_bv, COUNT(*) AS entry_count
FROM public.bv_ledger GROUP BY DATE(created_at), bv_type ORDER BY bv_date DESC;

CREATE OR REPLACE VIEW public.vw_rank_distribution AS
SELECT r.name AS rank_name, COUNT(m.id) AS member_count
FROM public.memberships m LEFT JOIN public.ranks r ON r.id = m.current_rank_id
GROUP BY r.name ORDER BY member_count DESC;

CREATE OR REPLACE VIEW public.vw_package_distribution AS
SELECT tier, COUNT(*) AS member_count, COALESCE(SUM(package_price),0) AS total_revenue
FROM public.memberships GROUP BY tier ORDER BY member_count DESC;

-- Seeds
INSERT INTO public.feature_flags (flag_code, flag_name, is_enabled, config) VALUES
('kyc_enforcement','KYC Enforcement',false,'{"required_for":["withdrawals","upgrades"]}'::jsonb),
('withdrawal_enabled','Withdrawals Enabled',true,'{}'::jsonb),
('coupon_system','Coupon System',true,'{}'::jsonb),
('token_issuance','Token Issuance',true,'{}'::jsonb),
('binary_payout','Binary Payout Engine',true,'{}'::jsonb),
('matching_bonus','Matching Bonus',true,'{}'::jsonb),
('maintenance_mode','Maintenance Mode',false,'{"message":"System under maintenance"}'::jsonb)
ON CONFLICT (flag_code) DO NOTHING;

INSERT INTO public.security_settings (setting_code, setting_value) VALUES
('session_timeout_minutes','{"value":60}'::jsonb),
('2fa_enforcement','{"enabled":false,"required_for":["super_admin"]}'::jsonb),
('min_withdrawal_php','{"value":500}'::jsonb),
('max_withdrawal_php','{"value":250000}'::jsonb),
('approval_required_threshold_php','{"value":50000}'::jsonb),
('country_restriction_mode','{"mode":"allowlist","default_allowed":true}'::jsonb)
ON CONFLICT (setting_code) DO NOTHING;

INSERT INTO public.country_rules (country_code, is_allowed, kyc_required, withdrawals_allowed, notes) VALUES
('PH',true,false,true,'Philippines - primary market'),
('US',true,true,true,'United States - KYC required'),
('SG',true,true,true,'Singapore'),
('JP',true,true,true,'Japan')
ON CONFLICT (country_code) DO NOTHING;

INSERT INTO public.permissions (key, label, description, category) VALUES
('reports.view','Reports View','View all reports','reports'),
('reports.export','Reports Export','Export reports','reports'),
('reports.saved_views.manage','Saved Views','Manage saved report views','reports'),
('kyc.review','KYC Review','Review KYC submissions','compliance'),
('country_rules.manage','Country Rules','Manage country rules','compliance'),
('placement_locks.view','Placement Locks View','View placement locks','compliance'),
('placement_locks.manage','Placement Locks Manage','Manage placement locks','compliance'),
('compliance.view','Compliance View','View compliance dashboard','compliance'),
('audit.entity_timeline.view','Entity Timeline','View entity timelines','audit'),
('reversals.view','Reversals View','View reversal history','audit'),
('fraud.view','Fraud View','View fraud flags','fraud'),
('fraud.manage','Fraud Manage','Manage fraud flags','fraud'),
('risk_reviews.manage','Risk Reviews','Manage risk reviews','fraud'),
('integrity_checks.view','Integrity Checks','View integrity checks','fraud'),
('feature_flags.view','Feature Flags View','View feature flags','hardening'),
('feature_flags.manage','Feature Flags Manage','Manage feature flags','hardening'),
('security_settings.view','Security Settings View','View security settings','hardening'),
('security_settings.manage','Security Settings Manage','Manage security settings','hardening'),
('admin_sessions.view','Admin Sessions','View admin sessions','hardening'),
('high_risk_actions.view','High Risk View','View high-risk actions','hardening'),
('high_risk_actions.approve','High Risk Approve','Approve high-risk actions','hardening')
ON CONFLICT (key) DO NOTHING;
