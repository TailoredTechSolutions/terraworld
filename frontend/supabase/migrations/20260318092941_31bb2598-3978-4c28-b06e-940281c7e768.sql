
-- Add internal_balance column to wallets table
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS internal_balance numeric NOT NULL DEFAULT 0;

-- Coupon packages (admin-configured)
CREATE TABLE public.coupon_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  usable_value_percent numeric NOT NULL DEFAULT 90,
  terra_fee_percent numeric NOT NULL DEFAULT 10,
  token_reward_percent numeric NOT NULL DEFAULT 5,
  bonus_percent numeric NOT NULL DEFAULT 0,
  bv_type text NOT NULL DEFAULT 'product',
  is_active boolean NOT NULL DEFAULT true,
  expiry_days integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupon packages viewable by all authenticated" ON public.coupon_packages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage coupon packages" ON public.coupon_packages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Coupon purchases (user records)
CREATE TABLE public.coupon_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.coupon_packages(id),
  price_paid numeric NOT NULL,
  usable_value numeric NOT NULL,
  terra_fee numeric NOT NULL,
  bv_generated numeric NOT NULL DEFAULT 0,
  token_reward numeric NOT NULL DEFAULT 0,
  bonus_value numeric NOT NULL DEFAULT 0,
  balance_remaining numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon purchases" ON public.coupon_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coupon purchases" ON public.coupon_purchases
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Read-only admins can view coupon purchases" ON public.coupon_purchases
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'::app_role));

-- Trigger for updated_at
CREATE TRIGGER set_coupon_packages_updated_at BEFORE UPDATE ON public.coupon_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_coupon_purchases_updated_at BEFORE UPDATE ON public.coupon_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default coupon packages matching membership tiers
INSERT INTO public.coupon_packages (name, description, price, usable_value_percent, terra_fee_percent, token_reward_percent, bonus_percent, bv_type) VALUES
  ('Consumer ₱500', 'Standard consumer coupon for marketplace purchases', 500, 90, 10, 5, 0, 'product'),
  ('Consumer ₱1,000', 'Consumer coupon with bonus credit', 1000, 90, 10, 5, 2.5, 'product'),
  ('Consumer ₱2,500', 'Premium consumer coupon', 2500, 90, 10, 5, 5, 'product'),
  ('Affiliate Starter', 'Starter affiliate coupon package', 500, 90, 10, 5, 0, 'membership'),
  ('Affiliate Basic', 'Basic affiliate coupon package', 1000, 90, 10, 5, 2.5, 'membership'),
  ('Affiliate Pro', 'Pro affiliate coupon package', 3000, 90, 10, 5, 5, 'membership'),
  ('Affiliate Elite', 'Elite affiliate coupon package', 5000, 90, 10, 5, 5, 'membership'),
  ('Farm Credit ₱5,000', 'Bulk farm credit for B2B buyers', 5000, 92, 8, 3, 0, 'product'),
  ('Farm Credit ₱10,000', 'Large bulk farm credit', 10000, 92, 8, 3, 2, 'product');
