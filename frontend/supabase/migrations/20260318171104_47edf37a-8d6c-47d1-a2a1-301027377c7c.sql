
-- Granular permissions system
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view permissions" ON public.permissions FOR SELECT TO authenticated USING (true);

-- Role-permission mapping
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own permissions" ON public.role_permissions FOR SELECT USING (auth.uid() = user_id);

-- Admin scopes for delegated access
CREATE TABLE public.admin_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope_key text NOT NULL,
  scope_value jsonb DEFAULT '{}'::jsonb,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope_key)
);

ALTER TABLE public.admin_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_scopes" ON public.admin_scopes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own scopes" ON public.admin_scopes FOR SELECT USING (auth.uid() = user_id);

-- System toggles table for global feature flags
CREATE TABLE public.system_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT true,
  label text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage toggles" ON public.system_toggles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view toggles" ON public.system_toggles FOR SELECT TO authenticated USING (true);

-- Security definer function for permission checks
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE user_id = _user_id AND permission_key = _permission_key
  ) OR public.has_role(_user_id, 'admin')
$$;

-- Seed default permissions
INSERT INTO public.permissions (key, label, category) VALUES
  ('view_farmer_dashboard', 'View Farmer Dashboard', 'dashboards'),
  ('manage_farmers', 'Manage Farmers', 'dashboards'),
  ('view_buyer_dashboard', 'View Buyer Dashboard', 'dashboards'),
  ('manage_buyers', 'Manage Buyers', 'dashboards'),
  ('view_driver_dashboard', 'View Driver Dashboard', 'dashboards'),
  ('manage_drivers', 'Manage Drivers', 'dashboards'),
  ('manage_orders', 'Manage Orders', 'operations'),
  ('manage_payouts', 'Manage Payouts', 'finance'),
  ('manage_coupons', 'Manage Coupons', 'finance'),
  ('manage_tokens', 'Manage Tokens', 'finance'),
  ('manage_binary_tree', 'Manage Binary Tree', 'mlm'),
  ('manage_members', 'Manage Members', 'mlm'),
  ('view_reports', 'View Reports', 'reporting'),
  ('export_reports', 'Export Reports', 'reporting'),
  ('manage_settings', 'Manage Settings', 'system'),
  ('manage_admins', 'Manage Admins', 'system'),
  ('manage_wallets', 'Manage Wallets', 'finance'),
  ('view_audit_logs', 'View Audit Logs', 'system'),
  ('manage_compliance', 'Manage Compliance', 'system'),
  ('manage_roles', 'Manage Roles & Security', 'system');

-- Seed system toggles
INSERT INTO public.system_toggles (feature_key, label, description) VALUES
  ('mlm_enabled', 'MLM Engine', 'Enable/disable MLM binary tree calculations and commissions'),
  ('tokens_enabled', 'Token Rewards', 'Enable/disable AGRI token earning and spending'),
  ('coupons_enabled', 'Coupon System', 'Enable/disable coupon purchases and redemption'),
  ('binary_calculations', 'Binary Calculations', 'Enable/disable automated binary pairing calculations'),
  ('withdrawals_enabled', 'Withdrawals', 'Enable/disable member withdrawal requests'),
  ('shop_enabled', 'Marketplace Shop', 'Enable/disable the marketplace shop for buyers'),
  ('driver_assignments', 'Driver Assignments', 'Enable/disable automatic driver assignment'),
  ('kyc_required', 'KYC Required', 'Require KYC verification for financial operations');
