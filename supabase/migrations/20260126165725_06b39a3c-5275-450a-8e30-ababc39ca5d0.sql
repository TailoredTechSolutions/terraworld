-- ================================================
-- SECURITY FIX: Restrict overly permissive RLS policies
-- ================================================

-- ISSUE 1: Orders publicly readable - exposes PII (customer names, emails, phones, addresses)
-- ISSUE 2: Any authenticated user can update any farmer record

-- Step 1: Drop the overly permissive SELECT policy on orders
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;

-- Step 2: Create more restrictive policy - orders can only be read via service role (backend)
-- Until auth is implemented, deny direct SELECT access and use edge functions
CREATE POLICY "Orders require authentication" 
ON public.orders FOR SELECT 
TO authenticated
USING (false);  -- Deny all direct reads until auth with user_id is implemented

-- Step 3: Drop the permissive UPDATE policy on farmers
DROP POLICY IF EXISTS "Authenticated users can update farmers" ON public.farmers;

-- Step 4: Create restrictive policy - farmers cannot be updated without ownership verification
-- Until auth is implemented with user_id column on farmers, deny updates
CREATE POLICY "Farmers update denied until auth implemented" 
ON public.farmers FOR UPDATE 
TO authenticated
USING (false)
WITH CHECK (false);

-- Step 5: Drop the permissive INSERT policy on orders (will use edge function instead)
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Step 6: Create a policy that allows inserts only via service role (edge functions)
-- Anonymous and authenticated users cannot insert directly
CREATE POLICY "Orders created via backend only" 
ON public.orders FOR INSERT 
TO authenticated
WITH CHECK (false);  -- Deny direct inserts, use edge function

-- Step 7: Similarly restrict drivers table updates
DROP POLICY IF EXISTS "Authenticated users can update drivers" ON public.drivers;

CREATE POLICY "Drivers update denied until auth implemented" 
ON public.drivers FOR UPDATE 
TO authenticated
USING (false)
WITH CHECK (false);

-- Step 8: Restrict driver inserts to service role
DROP POLICY IF EXISTS "Authenticated users can create drivers" ON public.drivers;

CREATE POLICY "Drivers created via backend only" 
ON public.drivers FOR INSERT 
TO authenticated
WITH CHECK (false);

-- Step 9: Restrict farmer inserts to service role
DROP POLICY IF EXISTS "Authenticated users can create farmers" ON public.farmers;

CREATE POLICY "Farmers created via backend only" 
ON public.farmers FOR INSERT 
TO authenticated
WITH CHECK (false);