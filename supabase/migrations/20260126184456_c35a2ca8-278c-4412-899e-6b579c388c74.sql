-- Create wallets table for internal fund management
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  available_balance NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
ON public.wallets FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL, -- 'credit', 'debit', 'withdrawal_request', 'withdrawal_approved'
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  description TEXT,
  reference_id UUID, -- Can link to payout_ledger, orders, etc.
  status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
ON public.wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.wallet_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create ranks table
CREATE TABLE public.ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_order INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  required_personal_bv NUMERIC NOT NULL DEFAULT 0,
  required_left_leg_bv NUMERIC NOT NULL DEFAULT 0,
  required_right_leg_bv NUMERIC NOT NULL DEFAULT 0,
  required_direct_referrals INTEGER NOT NULL DEFAULT 0,
  binary_match_percent NUMERIC NOT NULL DEFAULT 10,
  matching_bonus_depth INTEGER NOT NULL DEFAULT 0,
  daily_cap NUMERIC NOT NULL DEFAULT 0,
  badge_color TEXT NOT NULL DEFAULT 'gray',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read)
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ranks are viewable by everyone"
ON public.ranks FOR SELECT
USING (true);

-- Insert 7-tier rank system
INSERT INTO public.ranks (rank_order, name, required_personal_bv, required_left_leg_bv, required_right_leg_bv, required_direct_referrals, binary_match_percent, matching_bonus_depth, daily_cap, badge_color) VALUES
(1, 'Member', 0, 0, 0, 0, 10, 0, 0, 'gray'),
(2, 'Bronze', 500, 1000, 1000, 2, 10, 1, 5000, 'amber'),
(3, 'Silver', 1000, 5000, 5000, 5, 10, 2, 15000, 'slate'),
(4, 'Gold', 2500, 15000, 15000, 10, 10, 3, 50000, 'yellow'),
(5, 'Platinum', 5000, 50000, 50000, 20, 12, 4, 100000, 'cyan'),
(6, 'Diamond', 10000, 150000, 150000, 35, 15, 5, 250000, 'blue'),
(7, 'Crown Director', 25000, 500000, 500000, 50, 18, 7, 500000, 'purple');

-- Add current_rank to memberships table
ALTER TABLE public.memberships 
ADD COLUMN current_rank_id UUID REFERENCES public.ranks(id),
ADD COLUMN rank_achieved_at TIMESTAMP WITH TIME ZONE;

-- Set default rank for existing memberships
UPDATE public.memberships 
SET current_rank_id = (SELECT id FROM public.ranks WHERE rank_order = 1)
WHERE current_rank_id IS NULL;

-- Update handle_new_user function to also create wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_profile_id UUID;
  referral_code_input TEXT;
  default_rank_id UUID;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_referral_code);
  END LOOP;

  -- Check if user signed up with a referral code (stored in raw_user_meta_data)
  referral_code_input := NEW.raw_user_meta_data->>'referral_code';
  IF referral_code_input IS NOT NULL THEN
    SELECT id INTO referrer_profile_id FROM profiles WHERE referral_code = referral_code_input;
  END IF;

  -- Get default rank
  SELECT id INTO default_rank_id FROM ranks WHERE rank_order = 1;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    new_referral_code,
    referrer_profile_id
  );

  -- Create free membership with default rank
  INSERT INTO public.memberships (user_id, tier, package_price, membership_bv, current_rank_id)
  VALUES (NEW.id, 'free', 0, 0, default_rank_id);

  -- Assign member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');

  -- Create wallet
  INSERT INTO public.wallets (user_id, available_balance, pending_balance)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$;