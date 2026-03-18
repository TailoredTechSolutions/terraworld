
-- Phase 6: Tokenomics, Rewards & Coupon/Promotion

ALTER TABLE public.token_allocations ADD COLUMN IF NOT EXISTS burned_amount NUMERIC(24,8) NOT NULL DEFAULT 0;
ALTER TABLE public.token_allocations ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.token_issuances ADD COLUMN IF NOT EXISTS recipient_type TEXT NOT NULL DEFAULT 'member';
ALTER TABLE public.token_issuances ADD COLUMN IF NOT EXISTS recipient_id UUID;
ALTER TABLE public.token_issuances ADD COLUMN IF NOT EXISTS reward_rule_id UUID REFERENCES public.token_reward_rules(id);
ALTER TABLE public.token_issuances ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'posted';
ALTER TABLE public.token_issuances ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE public.token_issuances SET recipient_id = recipient_user_id WHERE recipient_id IS NULL AND recipient_user_id IS NOT NULL;
UPDATE public.token_issuances SET reward_rule_id = rule_id WHERE reward_rule_id IS NULL AND rule_id IS NOT NULL;
ALTER TABLE public.token_burn_events ADD COLUMN IF NOT EXISTS bucket_id UUID REFERENCES public.token_allocations(id);
ALTER TABLE public.token_burn_events ADD COLUMN IF NOT EXISTS token_amount NUMERIC(24,8);
ALTER TABLE public.token_burn_events ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.token_burn_events ADD COLUMN IF NOT EXISTS created_by UUID;
UPDATE public.token_burn_events SET token_amount = tokens_burned WHERE token_amount IS NULL AND tokens_burned IS NOT NULL;
ALTER TABLE public.token_reward_rules ADD COLUMN IF NOT EXISTS distribution_bucket_id UUID REFERENCES public.token_allocations(id);
ALTER TABLE public.promotion_campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS prevent_token_issuances_mutation ON public.token_issuances;
CREATE TRIGGER prevent_token_issuances_mutation BEFORE UPDATE OR DELETE ON public.token_issuances FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();
DROP TRIGGER IF EXISTS prevent_token_burn_events_mutation ON public.token_burn_events;
CREATE TRIGGER prevent_token_burn_events_mutation BEFORE UPDATE OR DELETE ON public.token_burn_events FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

CREATE TABLE IF NOT EXISTS public.token_issuance_reversals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), original_issuance_id UUID NOT NULL REFERENCES public.token_issuances(id), reversal_issuance_id UUID REFERENCES public.token_issuances(id), reason TEXT NOT NULL, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.token_issuance_reversals ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.token_reserve_releases (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), allocation_id UUID NOT NULL REFERENCES public.token_allocations(id), requested_amount NUMERIC(24,8) NOT NULL, purpose TEXT NOT NULL, governance_mode TEXT NOT NULL DEFAULT 'multisig', status TEXT NOT NULL DEFAULT 'pending', requested_by UUID, approved_by UUID, released_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), approved_at TIMESTAMPTZ, released_at TIMESTAMPTZ);
ALTER TABLE public.token_reserve_releases ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.token_wallet_postings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), issuance_id UUID REFERENCES public.token_issuances(id), burn_event_id UUID REFERENCES public.token_burn_events(id), wallet_id UUID, ledger_entry_id UUID, posting_type TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.token_wallet_postings ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.coupons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, type TEXT NOT NULL, applies_to TEXT NOT NULL, audience_type TEXT NOT NULL, discount_value NUMERIC(18,2), max_discount NUMERIC(18,2), token_bonus_php NUMERIC(18,2), usage_limit INTEGER, per_user_limit INTEGER, starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, is_stackable BOOLEAN NOT NULL DEFAULT false, status TEXT NOT NULL DEFAULT 'draft', created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), coupon_id UUID NOT NULL REFERENCES public.coupons(id), user_id UUID NOT NULL, reference_type TEXT, reference_id UUID, discount_applied NUMERIC(18,2) NOT NULL DEFAULT 0, token_bonus_issued NUMERIC(24,8), status TEXT NOT NULL DEFAULT 'redeemed', redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.campaign_coupon_links (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID NOT NULL REFERENCES public.promotion_campaigns(id) ON DELETE CASCADE, coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE, UNIQUE (campaign_id, coupon_id));
ALTER TABLE public.campaign_coupon_links ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.campaign_reward_rule_links (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id UUID NOT NULL REFERENCES public.promotion_campaigns(id) ON DELETE CASCADE, reward_rule_id UUID NOT NULL REFERENCES public.token_reward_rules(id) ON DELETE CASCADE, UNIQUE (campaign_id, reward_rule_id));
ALTER TABLE public.campaign_reward_rule_links ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.coupon_abuse_flags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), coupon_id UUID REFERENCES public.coupons(id), user_id UUID, redemption_id UUID REFERENCES public.coupon_redemptions(id), reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', flagged_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.coupon_abuse_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='token_issuance_reversals' AND policyname='p6_tir_sel') THEN CREATE POLICY "p6_tir_sel" ON public.token_issuance_reversals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='token_issuance_reversals' AND policyname='p6_tir_all') THEN CREATE POLICY "p6_tir_all" ON public.token_issuance_reversals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='token_reserve_releases' AND policyname='p6_trr_sel') THEN CREATE POLICY "p6_trr_sel" ON public.token_reserve_releases FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='token_reserve_releases' AND policyname='p6_trr_all') THEN CREATE POLICY "p6_trr_all" ON public.token_reserve_releases FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='token_wallet_postings' AND policyname='p6_twp_sel') THEN CREATE POLICY "p6_twp_sel" ON public.token_wallet_postings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='token_wallet_postings' AND policyname='p6_twp_all') THEN CREATE POLICY "p6_twp_all" ON public.token_wallet_postings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='p6_cpn_sel') THEN CREATE POLICY "p6_cpn_sel" ON public.coupons FOR SELECT TO authenticated USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='p6_cpn_all') THEN CREATE POLICY "p6_cpn_all" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_redemptions' AND policyname='p6_cr_sel') THEN CREATE POLICY "p6_cr_sel" ON public.coupon_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_redemptions' AND policyname='p6_cr_all') THEN CREATE POLICY "p6_cr_all" ON public.coupon_redemptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='campaign_coupon_links' AND policyname='p6_ccl_sel') THEN CREATE POLICY "p6_ccl_sel" ON public.campaign_coupon_links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='campaign_coupon_links' AND policyname='p6_ccl_all') THEN CREATE POLICY "p6_ccl_all" ON public.campaign_coupon_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='campaign_reward_rule_links' AND policyname='p6_crrl_sel') THEN CREATE POLICY "p6_crrl_sel" ON public.campaign_reward_rule_links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='campaign_reward_rule_links' AND policyname='p6_crrl_all') THEN CREATE POLICY "p6_crrl_all" ON public.campaign_reward_rule_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_abuse_flags' AND policyname='p6_caf_sel') THEN CREATE POLICY "p6_caf_sel" ON public.coupon_abuse_flags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_abuse_flags' AND policyname='p6_caf_all') THEN CREATE POLICY "p6_caf_all" ON public.coupon_abuse_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')); END IF;
END $$;

INSERT INTO public.token_allocations (bucket_code, bucket_name, allocation_percent, allocation_amount, remaining_amount, is_locked) VALUES
('FARMER_REWARDS','Farmer Rewards & Produce Incentives',30.00,75000000000,75000000000,true),
('NETWORK_REWARDS','Network Rewards & Compensation Plan',25.00,62500000000,62500000000,true),
('UTILITY_LIQUIDITY','Ecosystem & Utility Liquidity',15.00,37500000000,37500000000,true),
('PUBLIC_SALE','Public & Community Sale',10.00,25000000000,25000000000,true),
('TEAM_FOUNDERS','Team & Founders',8.00,20000000000,20000000000,true),
('PARTNERS_ADVISORS','Strategic Partners & Advisors',5.00,12500000000,12500000000,true),
('TREASURY_DAO','Treasury / DAO Reserve',5.00,12500000000,12500000000,true),
('MARKETING_ADOPTION','Marketing, Airdrops & Adoption',2.00,5000000000,5000000000,true)
ON CONFLICT (bucket_code) DO NOTHING;

INSERT INTO public.token_reward_rules (code, name, basis_type, reward_php, distribution_bucket_id, is_active)
SELECT 'FARMER_ONBOARD','Farmer Onboarding Reward','farmer_onboarded',500.00,id,true FROM public.token_allocations WHERE bucket_code='MARKETING_ADOPTION' ON CONFLICT (code) DO NOTHING;
INSERT INTO public.token_reward_rules (code, name, basis_type, reward_php, distribution_bucket_id, is_active)
SELECT 'CONSUMER_ONBOARD','Consumer Onboarding Reward','consumer_onboarded',100.00,id,true FROM public.token_allocations WHERE bucket_code='MARKETING_ADOPTION' ON CONFLICT (code) DO NOTHING;
INSERT INTO public.token_reward_rules (code, name, basis_type, reward_php, distribution_bucket_id, is_active)
SELECT 'TERRA_FEE_BV','Terra Fee BV Reward','terra_fee_bv',50.00,id,true FROM public.token_allocations WHERE bucket_code='NETWORK_REWARDS' ON CONFLICT (code) DO NOTHING;

INSERT INTO public.token_market_snapshots (price_php, source) SELECT 1.00,'initial_seed' WHERE NOT EXISTS (SELECT 1 FROM public.token_market_snapshots LIMIT 1);

INSERT INTO public.permissions (key, label, description, category) VALUES
('tokenomics.view','Tokenomics View','View tokenomics dashboard','tokenomics'),
('token_allocations.view','Allocations View','View allocation buckets','tokenomics'),
('token_allocations.manage','Allocations Manage','Manage allocation buckets','tokenomics'),
('token_rewards.view','Rewards View','View reward rules','tokenomics'),
('token_rewards.issue','Rewards Issue','Issue token rewards','tokenomics'),
('token_rewards.reverse','Rewards Reverse','Reverse issuances','tokenomics'),
('token_market_price.manage','Market Price','Manage market price','tokenomics'),
('token_burns.view','Burns View','View burn events','tokenomics'),
('token_burns.manage','Burns Manage','Manage burns','tokenomics'),
('token_reserves.view','Reserves View','View reserve releases','tokenomics'),
('token_reserves.release.request','Reserve Request','Request releases','tokenomics'),
('token_reserves.release.approve','Reserve Approve','Approve releases','tokenomics'),
('coupons.view','Coupons View','View coupons','coupons'),
('coupons.manage','Coupons Manage','Manage coupons','coupons'),
('coupon_redemptions.view','Redemptions View','View redemptions','coupons'),
('campaigns.view','Campaigns View','View campaigns','coupons'),
('campaigns.manage','Campaigns Manage','Manage campaigns','coupons'),
('coupon_abuse.view','Abuse View','View abuse flags','coupons'),
('coupon_abuse.manage','Abuse Manage','Manage abuse flags','coupons'),
('token_reports.view','Token Reports','View token reports','reports'),
('coupon_reports.view','Coupon Reports','View coupon reports','reports')
ON CONFLICT (key) DO NOTHING;
