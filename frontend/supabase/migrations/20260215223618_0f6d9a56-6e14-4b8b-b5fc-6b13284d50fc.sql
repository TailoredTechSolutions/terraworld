
-- ============================================================
-- 1. FIX ORDERS SELECT POLICIES
-- Currently "Orders require authentication" blocks ALL access (USING false).
-- Replace with proper policies: buyers see own orders, farmers see assigned, admins see all.
-- ============================================================

DROP POLICY IF EXISTS "Orders require authentication" ON public.orders;

-- Buyers can view their own orders (matched by customer_email via profiles)
CREATE POLICY "Buyers can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    customer_email = (
      SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
    )
  );

-- Farmers can view orders assigned to their farm
CREATE POLICY "Farmers can view assigned orders"
  ON public.orders
  FOR SELECT
  USING (
    farmer_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.farmers f
      WHERE f.id = orders.farmer_id
        AND f.email = (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 2. FIX ORDER_ITEMS SELECT POLICY
-- Currently "Users can view own order items" checks admin role instead of ownership.
-- ============================================================

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

-- Users can view items for orders they can see
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          -- Buyer owns the order
          o.customer_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
          -- Or farmer owns the order
          OR EXISTS (
            SELECT 1 FROM public.farmers f
            WHERE f.id = o.farmer_id
              AND f.email = (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
          )
          -- Or admin
          OR has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

-- ============================================================
-- 3. ATOMIC WALLET BALANCE FUNCTION (fixes race condition)
-- Uses SELECT FOR UPDATE to lock wallet row during transaction
-- ============================================================

CREATE OR REPLACE FUNCTION public.post_wallet_entry(
  p_user_id UUID,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL
)
RETURNS TABLE(wallet_id UUID, balance_before NUMERIC, balance_after NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
BEGIN
  -- Lock wallet row to prevent concurrent modifications
  SELECT w.id, w.available_balance INTO v_wallet_id, v_balance_before
  FROM wallets w
  WHERE w.user_id = p_user_id
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  -- Calculate new balance atomically
  v_balance_after := ROUND(v_balance_before + p_amount, 2);

  -- Insert ledger entry
  INSERT INTO wallet_transactions (
    user_id, wallet_id, transaction_type, amount,
    balance_before, balance_after, description,
    reference_id, actor_id, status
  ) VALUES (
    p_user_id, v_wallet_id, p_transaction_type, p_amount,
    v_balance_before, v_balance_after, p_description,
    p_reference_id, p_actor_id, 'completed'
  );

  -- Update wallet balance
  UPDATE wallets
  SET available_balance = v_balance_after,
      updated_at = now()
  WHERE id = v_wallet_id;

  RETURN QUERY SELECT v_wallet_id, v_balance_before, v_balance_after;
END;
$$;
