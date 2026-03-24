
-- Withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  amount NUMERIC NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('gcash', 'bank', 'crypto')),
  account_details JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'flagged')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  reference_code TEXT NOT NULL DEFAULT ('WD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawal_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update withdrawals" ON public.withdrawal_requests
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Platform settings table for configurable pricing
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.platform_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.platform_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Delivery zones table
CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  base_fee NUMERIC NOT NULL DEFAULT 45,
  per_km_rate NUMERIC NOT NULL DEFAULT 5,
  min_distance_km NUMERIC NOT NULL DEFAULT 0,
  max_distance_km NUMERIC NOT NULL DEFAULT 999,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read zones" ON public.delivery_zones
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage zones" ON public.delivery_zones
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Backend can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- Seed default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
  ('terra_fee_percent', '30'::jsonb, 'Terra service fee percentage on farmer price'),
  ('tax_rate_percent', '0'::jsonb, 'Sales tax/VAT percentage'),
  ('compensation_pool_percent', '33'::jsonb, 'Percentage of Terra fee allocated to compensation pool'),
  ('min_withdrawal', '500'::jsonb, 'Minimum withdrawal amount in PHP'),
  ('max_daily_withdrawal', '50000'::jsonb, 'Maximum daily withdrawal amount in PHP'),
  ('withdrawal_fee_percent', '2'::jsonb, 'Processing fee percentage for withdrawals'),
  ('bv_expiry_days', '90'::jsonb, 'Days before unmatched BV expires (FIFO)'),
  ('token_market_price', '0.50'::jsonb, 'Current AGRI token price in PHP');

-- Seed default delivery zones
INSERT INTO public.delivery_zones (zone_name, base_fee, per_km_rate, min_distance_km, max_distance_km) VALUES
  ('Metro Manila', 45, 5, 0, 15),
  ('Greater Manila', 75, 8, 15, 50),
  ('Provincial', 150, 12, 50, 200),
  ('Remote', 300, 15, 200, 999);
