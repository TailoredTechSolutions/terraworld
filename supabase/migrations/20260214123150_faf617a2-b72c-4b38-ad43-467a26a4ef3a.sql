
-- ====================================================================
-- TERRA PLATFORM SCHEMA ENHANCEMENT
-- Shop Module, BV Separation, Wallet/Ledger Improvements
-- ====================================================================

-- 1. SHOP PRODUCTS TABLE (coupons, tickets, merchandise)
CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL CHECK (product_type IN ('coupon', 'ticket', 'merchandise')),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(15,2) NOT NULL DEFAULT 0,
  token_price NUMERIC(15,2),
  stock_quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
  metadata JSONB DEFAULT '{}',
  image_url TEXT,
  terra_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 30.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop products viewable by all authenticated" ON public.shop_products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage shop products" ON public.shop_products
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. ORDER ITEMS TABLE (line items for orders)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  shop_product_id UUID REFERENCES public.shop_products(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL,
  total_price NUMERIC(15,2) NOT NULL,
  variant_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_items.order_id
      AND has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- 3. DIGITAL ASSETS TABLE (coupons & tickets owned by members)
CREATE TABLE public.digital_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  shop_product_id UUID NOT NULL REFERENCES public.shop_products(id),
  order_id UUID REFERENCES public.orders(id),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('coupon', 'ticket')),
  asset_code TEXT UNIQUE NOT NULL,
  qr_data TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('issued', 'active', 'redeemed', 'expired', 'voided')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own digital assets" ON public.digital_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage digital assets" ON public.digital_assets
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. ENHANCE ORDERS TABLE - add order_type and bv_type
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'product'
    CHECK (order_type IN ('product', 'membership', 'shop_coupon', 'shop_ticket', 'shop_merchandise')),
  ADD COLUMN IF NOT EXISTS bv_type TEXT DEFAULT 'product'
    CHECK (bv_type IN ('product', 'membership')),
  ADD COLUMN IF NOT EXISTS payment_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount NUMERIC(15,2) NOT NULL DEFAULT 0;

-- 5. ENHANCE BINARY LEDGER - separate product vs membership BV
ALTER TABLE public.binary_ledger
  ADD COLUMN IF NOT EXISTS left_product_bv NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS right_product_bv NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS left_membership_bv NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS right_membership_bv NUMERIC(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fail_safe_triggered BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS adjusted_cycle_value NUMERIC(10,2);

-- 6. ENHANCE WALLET TRANSACTIONS - add balance_before for audit trail
ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS balance_before NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS actor_id UUID,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 7. APPEND-ONLY ENFORCEMENT on wallet_transactions via trigger
CREATE OR REPLACE FUNCTION public.prevent_ledger_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries cannot be modified or deleted. Use reversal entries instead.';
  RETURN NULL;
END;
$$;

CREATE TRIGGER enforce_append_only_wallet_transactions
  BEFORE UPDATE OR DELETE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 8. APPEND-ONLY ENFORCEMENT on payout_ledger
CREATE TRIGGER enforce_append_only_payout_ledger
  BEFORE UPDATE OR DELETE ON public.payout_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 9. APPEND-ONLY ENFORCEMENT on bv_ledger
CREATE TRIGGER enforce_append_only_bv_ledger
  BEFORE UPDATE OR DELETE ON public.bv_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 10. APPEND-ONLY ENFORCEMENT on token_ledger
CREATE TRIGGER enforce_append_only_token_ledger
  BEFORE UPDATE OR DELETE ON public.token_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 11. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_shop_products_type ON public.shop_products(product_type);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON public.shop_products(status);
CREATE INDEX IF NOT EXISTS idx_digital_assets_user ON public.digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_status ON public.digital_assets(status);
CREATE INDEX IF NOT EXISTS idx_digital_assets_code ON public.digital_assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON public.wallet_transactions(created_at DESC);

-- 12. UPDATED_AT TRIGGERS for new tables
CREATE TRIGGER update_shop_products_updated_at
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 13. GENERATE ASSET CODE function
CREATE OR REPLACE FUNCTION public.generate_asset_code(prefix TEXT DEFAULT 'AST')
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := prefix || '-';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;
