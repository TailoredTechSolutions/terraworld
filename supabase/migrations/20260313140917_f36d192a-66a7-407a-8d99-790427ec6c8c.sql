
-- 1. Fix: Any buyer can read all delivery bookings (add ownership check)
DROP POLICY IF EXISTS "Buyers can view own order bookings" ON public.delivery_bookings;
CREATE POLICY "Buyers can view own order bookings"
ON public.delivery_bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = delivery_bookings.order_id
    AND o.customer_email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

-- 2. Fix: Any farmer can update any order (scope to own orders only)
DROP POLICY IF EXISTS "Assigned farmers can update orders" ON public.orders;
CREATE POLICY "Assigned farmers can update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM farmers f
    WHERE f.id = orders.farmer_id
    AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

-- 3. Fix: Users can manipulate their own membership rank/tree
-- Remove the broad user update policy and replace with restricted one
DROP POLICY IF EXISTS "Users can update own membership" ON public.memberships;
-- No client-side update allowed; all membership mutations must go through backend

-- 4. Fix: Security definer view (farmers_public)
DROP VIEW IF EXISTS public.farmers_public;
CREATE VIEW public.farmers_public
WITH (security_invoker = true)
AS SELECT
  id, name, description, location, image_url,
  latitude, longitude, rating, products_count,
  total_sales, status, created_at, updated_at
FROM public.farmers;
