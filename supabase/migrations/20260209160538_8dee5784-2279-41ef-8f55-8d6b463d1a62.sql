
-- Fix overly permissive UPDATE policy on orders table
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;

-- Only admins, assigned drivers, and assigned farmers can update orders
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Assigned drivers can update orders"
ON public.orders
FOR UPDATE
USING (
  driver_id IS NOT NULL 
  AND has_role(auth.uid(), 'driver'::app_role)
);

CREATE POLICY "Assigned farmers can update orders"
ON public.orders
FOR UPDATE
USING (
  farmer_id IS NOT NULL 
  AND has_role(auth.uid(), 'farmer'::app_role)
);
