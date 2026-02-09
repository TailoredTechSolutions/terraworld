
-- Fix overly permissive RLS policies on products table
-- Drop the permissive INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- Create farmer-scoped policies: only the farmer who owns the product can modify it
CREATE POLICY "Farmers can create own products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.farmers f
    WHERE f.id = farmer_id
    AND has_role(auth.uid(), 'farmer'::app_role)
  )
);

CREATE POLICY "Farmers can update own products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.farmers f
    WHERE f.id = farmer_id
    AND has_role(auth.uid(), 'farmer'::app_role)
  )
);

CREATE POLICY "Farmers can delete own products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.farmers f
    WHERE f.id = farmer_id
    AND has_role(auth.uid(), 'farmer'::app_role)
  )
);

-- Admins can manage all products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
