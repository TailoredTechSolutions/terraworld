
-- 1. Drivers can view their own driver record (matched by email via profiles)
CREATE POLICY "Drivers can view own record"
ON public.drivers FOR SELECT
TO authenticated
USING (
  email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
);

-- 2. Drivers can update their own driver record
CREATE POLICY "Drivers can update own record"
ON public.drivers FOR UPDATE
TO authenticated
USING (
  email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
);

-- 3. Drivers can view orders assigned to them
CREATE POLICY "Drivers can view assigned orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  driver_id IN (
    SELECT d.id FROM drivers d
    WHERE d.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

-- 4. Fix driver UPDATE policy to be scoped to own assignments only
DROP POLICY IF EXISTS "Assigned drivers can update orders" ON public.orders;
CREATE POLICY "Assigned drivers can update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  driver_id IN (
    SELECT d.id FROM drivers d
    WHERE d.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

-- 5. Drivers can view delivery bookings for their assigned orders
CREATE POLICY "Drivers can view assigned delivery bookings"
ON public.delivery_bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = delivery_bookings.order_id
    AND o.driver_id IN (
      SELECT d.id FROM drivers d
      WHERE d.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    )
  )
);
