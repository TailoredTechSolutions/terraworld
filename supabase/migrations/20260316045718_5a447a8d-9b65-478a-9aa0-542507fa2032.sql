
-- ============================================================
-- FIX 7: Products table - add ownership check to farmer policies
-- Any farmer can currently CRUD other farmers' products
-- ============================================================

DROP POLICY IF EXISTS "Farmers can create own products" ON public.products;
DROP POLICY IF EXISTS "Farmers can update own products" ON public.products;
DROP POLICY IF EXISTS "Farmers can delete own products" ON public.products;

CREATE POLICY "Farmers can create own products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM farmers f
    WHERE f.id = products.farmer_id
    AND has_role(auth.uid(), 'farmer'::app_role)
    AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

CREATE POLICY "Farmers can update own products"
ON public.products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM farmers f
    WHERE f.id = products.farmer_id
    AND has_role(auth.uid(), 'farmer'::app_role)
    AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

CREATE POLICY "Farmers can delete own products"
ON public.products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM farmers f
    WHERE f.id = products.farmer_id
    AND has_role(auth.uid(), 'farmer'::app_role)
    AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
);

-- ============================================================
-- FIX 8: farmers_public view - enable RLS with explicit policy
-- Makes the public access deliberate and auditable
-- ============================================================

ALTER VIEW public.farmers_public SET (security_invoker = on);
