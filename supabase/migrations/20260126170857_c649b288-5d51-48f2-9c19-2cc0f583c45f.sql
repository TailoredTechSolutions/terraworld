-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'business_buyer', 'member', 'driver', 'admin');

-- 2. Create membership tier enum
CREATE TYPE public.membership_tier AS ENUM ('free', 'starter', 'basic', 'pro', 'elite');

-- 3. User roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Memberships table
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tier membership_tier NOT NULL DEFAULT 'free',
    package_price NUMERIC NOT NULL DEFAULT 0,
    membership_bv NUMERIC NOT NULL DEFAULT 0,
    sponsor_id UUID REFERENCES auth.users(id),
    left_leg_id UUID,
    right_leg_id UUID,
    placement_side TEXT CHECK (placement_side IN ('left', 'right')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own membership"
ON public.memberships FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships"
ON public.memberships FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own membership"
ON public.memberships FOR UPDATE
USING (auth.uid() = user_id);

-- 7. BV Ledger (immutable audit trail)
CREATE TABLE public.bv_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    bv_type TEXT NOT NULL CHECK (bv_type IN ('product', 'membership')),
    leg TEXT CHECK (leg IN ('left', 'right')),
    bv_amount NUMERIC NOT NULL,
    terra_fee NUMERIC,
    source_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bv_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BV"
ON public.bv_ledger FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all BV"
ON public.bv_ledger FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Binary matching ledger
CREATE TABLE public.binary_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    payout_period DATE NOT NULL,
    left_bv NUMERIC NOT NULL DEFAULT 0,
    right_bv NUMERIC NOT NULL DEFAULT 0,
    matched_bv NUMERIC NOT NULL DEFAULT 0,
    binary_income NUMERIC NOT NULL DEFAULT 0,
    cap_applied NUMERIC NOT NULL DEFAULT 0,
    carryforward_left NUMERIC NOT NULL DEFAULT 0,
    carryforward_right NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.binary_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own binary"
ON public.binary_ledger FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all binary"
ON public.binary_ledger FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Payout ledger (all bonus types)
CREATE TABLE public.payout_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    payout_period DATE NOT NULL,
    bonus_type TEXT NOT NULL CHECK (bonus_type IN ('direct_product', 'direct_membership', 'binary', 'matching')),
    gross_amount NUMERIC NOT NULL,
    net_amount NUMERIC NOT NULL,
    source_order_id UUID REFERENCES public.orders(id),
    source_user_id UUID REFERENCES auth.users(id),
    level_depth INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts"
ON public.payout_ledger FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payouts"
ON public.payout_ledger FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Compensation pool tracking
CREATE TABLE public.compensation_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_period DATE NOT NULL UNIQUE,
    total_terra_fees NUMERIC NOT NULL DEFAULT 0,
    pool_amount NUMERIC NOT NULL DEFAULT 0,
    membership_bv_payout NUMERIC NOT NULL DEFAULT 0,
    failsafe_ratio NUMERIC,
    cycle_value_adjustment NUMERIC DEFAULT 1.0,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.compensation_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pools"
ON public.compensation_pools FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 11. Token ledger (non-cash utility)
CREATE TABLE public.token_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tokens_issued NUMERIC NOT NULL,
    php_reward_value NUMERIC NOT NULL,
    token_market_price NUMERIC NOT NULL,
    source_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.token_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
ON public.token_ledger FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage tokens"
ON public.token_ledger FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Add Terra fee columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS farmer_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS terra_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS terra_fee_bv NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES auth.users(id);

-- 13. Trigger for membership updated_at
CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();