
-- ═══════════════════════════════════════════════
-- PHASE 2: Marketplace, Finance, Logistics, Support tables
-- ═══════════════════════════════════════════════

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

-- Seed default categories
INSERT INTO public.categories (name, slug) VALUES
  ('Vegetables', 'vegetables'),
  ('Fruits', 'fruits'),
  ('Dairy & Eggs', 'dairy-eggs'),
  ('Pantry & Grains', 'pantry-grains'),
  ('Herbs & Spices', 'herbs-spices'),
  ('Meat & Poultry', 'meat-poultry'),
  ('Beverages', 'beverages'),
  ('Organic Produce', 'organic-produce')
ON CONFLICT (slug) DO NOTHING;

-- 2. Inventory Movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id),
  movement_type text NOT NULL,
  qty integer NOT NULL,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory_movements" ON public.inventory_movements FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view inventory_movements" ON public.inventory_movements FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- Immutable
CREATE TRIGGER prevent_inventory_movement_mutation
  BEFORE UPDATE OR DELETE ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 3. Pricing Rules
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  terra_fee_mode text NOT NULL DEFAULT 'percent',
  terra_fee_value numeric(18,4) NOT NULL DEFAULT 20.0000,
  tax_mode text NOT NULL DEFAULT 'percent',
  tax_value numeric(18,4) NOT NULL DEFAULT 12.0000,
  transport_mode text NOT NULL DEFAULT 'distance_zone',
  transport_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage pricing_rules" ON public.pricing_rules FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view pricing_rules" ON public.pricing_rules FOR SELECT TO authenticated USING (true);

-- Seed default pricing rule
INSERT INTO public.pricing_rules (rule_name, terra_fee_mode, terra_fee_value, tax_mode, tax_value, transport_mode, is_active) VALUES
  ('Default Pricing', 'percent', 20.0000, 'percent', 12.0000, 'distance_zone', true);

-- 4. Payment Transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  provider text NOT NULL,
  provider_reference text,
  amount numeric(18,2) NOT NULL,
  currency text NOT NULL DEFAULT 'PHP',
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage payment_transactions" ON public.payment_transactions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view payment_transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- Immutable
CREATE TRIGGER prevent_payment_transaction_mutation
  BEFORE UPDATE OR DELETE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 5. Payment Reconciliation
CREATE TABLE IF NOT EXISTS public.payment_reconciliation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id uuid NOT NULL REFERENCES public.payment_transactions(id),
  reconciled_amount numeric(18,2) NOT NULL,
  variance_amount numeric(18,2) NOT NULL DEFAULT 0,
  reconciliation_status text NOT NULL DEFAULT 'pending',
  reconciled_by uuid,
  reconciled_at timestamptz,
  notes text
);
ALTER TABLE public.payment_reconciliation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage payment_reconciliation" ON public.payment_reconciliation FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view payment_reconciliation" ON public.payment_reconciliation FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 6. Refund Cases
CREATE TABLE IF NOT EXISTS public.refund_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  ticket_id uuid REFERENCES public.support_tickets(id),
  requested_amount numeric(18,2) NOT NULL,
  approved_amount numeric(18,2),
  status text NOT NULL DEFAULT 'requested',
  reason text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refund_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage refund_cases" ON public.refund_cases FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view refund_cases" ON public.refund_cases FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 7. Return Cases
CREATE TABLE IF NOT EXISTS public.return_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  ticket_id uuid REFERENCES public.support_tickets(id),
  status text NOT NULL DEFAULT 'requested',
  reason text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.return_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage return_cases" ON public.return_cases FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view return_cases" ON public.return_cases FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 8. Delivery Events
CREATE TABLE IF NOT EXISTS public.delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_booking_id uuid NOT NULL REFERENCES public.delivery_bookings(id),
  event_type text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage delivery_events" ON public.delivery_events FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view delivery_events" ON public.delivery_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- Immutable
CREATE TRIGGER prevent_delivery_event_mutation
  BEFORE UPDATE OR DELETE ON public.delivery_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- 9. Driver Performance Daily
CREATE TABLE IF NOT EXISTS public.driver_performance_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  stat_date date NOT NULL,
  assigned_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  avg_delivery_minutes numeric(12,2),
  UNIQUE(driver_id, stat_date)
);
ALTER TABLE public.driver_performance_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage driver_performance_daily" ON public.driver_performance_daily FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view driver_performance_daily" ON public.driver_performance_daily FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));

-- 10. Payout Records (operational payouts for farmers, drivers)
CREATE TABLE IF NOT EXISTS public.payout_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL,
  recipient_id uuid NOT NULL,
  source_type text NOT NULL,
  source_id uuid,
  gross_amount numeric(18,2) NOT NULL,
  fee_amount numeric(18,2) NOT NULL DEFAULT 0,
  net_amount numeric(18,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
ALTER TABLE public.payout_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage payout_records" ON public.payout_records FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Read-only admins can view payout_records" ON public.payout_records FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin_readonly'));
CREATE POLICY "Users can view own payout_records" ON public.payout_records FOR SELECT USING (auth.uid() = recipient_id);

-- Seed Phase 2 permissions
INSERT INTO public.permissions (key, label, category) VALUES
  ('products.view', 'View Products', 'marketplace'),
  ('categories.manage', 'Manage Categories', 'marketplace'),
  ('inventory.view', 'View Inventory', 'marketplace'),
  ('inventory.manage', 'Manage Inventory', 'marketplace'),
  ('pricing.view', 'View Pricing', 'marketplace'),
  ('payments.view', 'View Payments', 'financial'),
  ('payouts.view', 'View Payouts', 'financial'),
  ('payouts.manage', 'Manage Payouts', 'financial'),
  ('fees.manage', 'Manage Platform Fees', 'financial'),
  ('tax.manage', 'Manage Tax Config', 'financial'),
  ('routes.view', 'View Routes', 'logistics'),
  ('returns.manage', 'Manage Returns', 'support')
ON CONFLICT (key) DO NOTHING;
