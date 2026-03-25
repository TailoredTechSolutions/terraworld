-- Terra Farming - Supabase Database Setup
-- Run these SQL statements in your Supabase SQL Editor
-- =====================================================

-- 1. AUDIT LOG TABLE (for admin impersonation logging)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read, no one can update/delete (immutable)
CREATE POLICY "Admins can read audit logs"
    ON public.audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_log FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 2. VIEW FOR IMPERSONATION LOG
-- =====================================================
CREATE OR REPLACE VIEW public.admin_impersonation_log AS
SELECT
    al.id,
    al.user_id AS admin_user_id,
    p.full_name AS admin_name,
    p.email AS admin_email,
    al.metadata->>'target_user_id' AS target_user_id,
    al.metadata->>'target_email' AS target_email,
    al.metadata->>'action' AS action_type,
    al.created_at
FROM public.audit_log al
LEFT JOIN public.profiles p ON p.user_id = al.user_id
WHERE al.action IN (
    'admin_view_as_user',
    'admin_view_farmer_dashboard',
    'admin_view_buyer_dashboard',
    'admin_view_driver_dashboard',
    'admin_view_bc_dashboard',
    'admin_return_to_own_view'
)
ORDER BY al.created_at DESC;

-- 3. RPC: LOG ADMIN IMPERSONATION
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_admin_impersonation(
    p_target_user_id UUID,
    p_target_email TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'admin_view_as_user'
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_log (user_id, action, metadata, created_at)
    VALUES (
        auth.uid(),
        p_action,
        jsonb_build_object(
            'target_user_id', p_target_user_id,
            'target_email', p_target_email,
            'action', p_action
        ),
        now()
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_impersonation TO authenticated;

-- 4. PRIVACY POLICY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.privacy_policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    effective_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    policy_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.privacy_policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read privacy policy"
    ON public.privacy_policy_versions FOR SELECT USING (true);

-- RPC to get current privacy policy
CREATE OR REPLACE FUNCTION public.get_current_privacy_policy()
RETURNS TABLE (version TEXT, effective_date DATE, policy_text TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT version, effective_date, policy_text
    FROM public.privacy_policy_versions
    WHERE is_current = true LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_privacy_policy() TO anon, authenticated;

-- Insert initial privacy policy
INSERT INTO public.privacy_policy_versions (version, effective_date, is_current, policy_text)
VALUES (
    '1.0',
    '2026-03-25',
    true,
    'Terra Farming Privacy Policy - Version 1.0'
) ON CONFLICT DO NOTHING;

-- 5. RPC: DELETE USER ACCOUNT
-- =====================================================
CREATE OR REPLACE FUNCTION public.delete_user_account(
    p_user_id UUID,
    p_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Verify the user is deleting their own account
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    -- Log the deletion request
    INSERT INTO public.audit_log (user_id, action, metadata, created_at)
    VALUES (p_user_id, 'account_deletion_requested',
        jsonb_build_object('role', p_role, 'requested_at', now()), now());
    
    -- Anonymize profile
    UPDATE public.profiles
    SET full_name = '[Deleted User]', 
        email = NULL, 
        phone = NULL, 
        avatar_url = NULL, 
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Handle farmer-specific cleanup
    IF p_role = 'farmer' THEN
        UPDATE public.listings SET status = 'deleted'
        WHERE farmer_id = p_user_id AND status IN ('active', 'pending');
        
        UPDATE public.farmers SET status = 'inactive'
        WHERE user_id = p_user_id;
    END IF;
    
    -- Handle driver-specific cleanup
    IF p_role = 'driver' THEN
        UPDATE public.drivers SET status = 'inactive'
        WHERE user_id = p_user_id;
    END IF;
    
    -- Cancel pending orders
    UPDATE public.orders
    SET status = 'cancelled_account_deleted'
    WHERE (buyer_id = p_user_id OR driver_id = p_user_id)
      AND status NOT IN ('completed', 'cancelled', 'cancelled_account_deleted');
    
    -- Remove user roles
    DELETE FROM public.user_roles WHERE user_id = p_user_id;
    
    -- Finally, delete the auth user
    DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID, TEXT) TO authenticated;

-- 6. Update Supabase Auth Settings
-- =====================================================
-- NOTE: Set these in your Supabase Dashboard > Auth > Settings:
-- - Minimum password length: 12
-- - Enable Apple OAuth provider
-- - Configure Apple OAuth with your Apple Developer credentials

-- =====================================================
-- END OF SETUP
-- =====================================================
