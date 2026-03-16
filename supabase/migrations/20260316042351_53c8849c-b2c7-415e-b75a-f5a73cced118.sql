
-- ============================================================
-- FIX 1: Farmer PII - restrict anon access to non-PII columns
-- ============================================================

-- Drop the overly permissive policy that exposes PII to anon
DROP POLICY IF EXISTS "Public can view active farmers via view" ON public.farmers;

-- Re-create for authenticated users only (they need full data for their own record via other policies)
CREATE POLICY "Authenticated can view active farmers"
ON public.farmers FOR SELECT
TO authenticated
USING (status = 'active'::farmer_status);

-- Anon users get a column-restricted policy via security definer function
-- Since RLS can't restrict columns, anon should use the farmers_public view.
-- Block direct anon SELECT on farmers table entirely:
CREATE POLICY "Anon blocked from farmers table"
ON public.farmers FOR SELECT
TO anon
USING (false);

-- ============================================================
-- FIX 2: Delivery bookings - scope farmer access to own orders
-- ============================================================

DROP POLICY IF EXISTS "Farmers can view assigned order bookings" ON public.delivery_bookings;

CREATE POLICY "Farmers can view own order bookings"
ON public.delivery_bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = delivery_bookings.order_id
    AND EXISTS (
      SELECT 1 FROM farmers f
      WHERE f.id = o.farmer_id
      AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    )
  )
);

-- ============================================================
-- FIX 3: Product images - verify product ownership
-- ============================================================

DROP POLICY IF EXISTS "Farmers can insert own product images" ON public.product_images;
DROP POLICY IF EXISTS "Farmers can delete own product images" ON public.product_images;

CREATE POLICY "Farmers can insert own product images"
ON public.product_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN farmers f ON f.id = p.farmer_id
    WHERE p.id = product_images.product_id
    AND f.email = (SELECT pr.email FROM profiles pr WHERE pr.user_id = auth.uid() LIMIT 1)
  )
);

CREATE POLICY "Farmers can delete own product images"
ON public.product_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN farmers f ON f.id = p.farmer_id
    WHERE p.id = product_images.product_id
    AND f.email = (SELECT pr.email FROM profiles pr WHERE pr.user_id = auth.uid() LIMIT 1)
  )
);

-- ============================================================
-- FIX 4: Platform settings - switch to allowlist
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users view basic settings" ON public.platform_settings;

CREATE POLICY "Authenticated users view allowed settings"
ON public.platform_settings FOR SELECT
TO authenticated
USING (
  setting_key = ANY (ARRAY[
    'terra_fee_percent',
    'tax_rate_percent',
    'token_market_price',
    'min_withdrawal',
    'max_daily_withdrawal',
    'withdrawal_fee_percent',
    'bv_expiry_days'
  ])
);
