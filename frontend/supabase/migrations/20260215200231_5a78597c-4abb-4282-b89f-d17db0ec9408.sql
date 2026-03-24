-- Add 'buyer' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'buyer';

-- Update handle_new_user to accept a registration_role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_profile_id UUID;
  referral_code_input TEXT;
  default_rank_id UUID;
  registration_role TEXT;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_referral_code);
  END LOOP;

  -- Check if user signed up with a referral code
  referral_code_input := NEW.raw_user_meta_data->>'referral_code';
  IF referral_code_input IS NOT NULL AND referral_code_input != '' THEN
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

  -- Determine registration role from metadata (default to 'buyer')
  registration_role := COALESCE(NEW.raw_user_meta_data->>'registration_role', 'buyer');

  -- Assign the chosen role
  IF registration_role = 'farmer' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer');
  END IF;

  -- Also assign member role so they get MLM/token/referral access
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');

  -- Create wallet
  INSERT INTO public.wallets (user_id, available_balance, pending_balance)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$;