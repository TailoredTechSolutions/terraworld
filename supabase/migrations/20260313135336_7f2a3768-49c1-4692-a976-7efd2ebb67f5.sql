
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_referral_code TEXT;
  referrer_profile_id UUID;
  referral_code_input TEXT;
  default_rank_id UUID;
  registration_role TEXT;
BEGIN
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_referral_code);
  END LOOP;

  referral_code_input := NEW.raw_user_meta_data->>'referral_code';
  IF referral_code_input IS NOT NULL AND referral_code_input != '' THEN
    SELECT id INTO referrer_profile_id FROM profiles WHERE referral_code = referral_code_input;
  END IF;

  SELECT id INTO default_rank_id FROM ranks WHERE rank_order = 1;

  INSERT INTO public.profiles (user_id, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    new_referral_code,
    referrer_profile_id
  );

  INSERT INTO public.memberships (user_id, tier, package_price, membership_bv, current_rank_id)
  VALUES (NEW.id, 'free', 0, 0, default_rank_id);

  registration_role := COALESCE(NEW.raw_user_meta_data->>'registration_role', 'buyer');

  IF registration_role = 'farmer' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer');
  ELSIF registration_role = 'affiliate' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'affiliate');
  ELSIF registration_role = 'driver' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'driver');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer');
  END IF;

  INSERT INTO public.wallets (user_id, available_balance, pending_balance)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$function$;
