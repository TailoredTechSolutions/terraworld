import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRoles } from "./useUserRoles";

export type PermissionKey =
  | 'view_farmer_dashboard' | 'manage_farmers'
  | 'view_buyer_dashboard' | 'manage_buyers'
  | 'view_driver_dashboard' | 'manage_drivers'
  | 'manage_orders' | 'manage_payouts' | 'manage_coupons'
  | 'manage_tokens' | 'manage_binary_tree' | 'manage_members'
  | 'view_reports' | 'export_reports'
  | 'manage_settings' | 'manage_admins' | 'manage_wallets'
  | 'view_audit_logs' | 'manage_compliance' | 'manage_roles';

interface Permission {
  key: string;
  label: string;
  category: string;
}

interface UsePermissionsReturn {
  permissions: string[];
  allPermissions: Permission[];
  loading: boolean;
  hasPermission: (key: PermissionKey) => boolean;
  hasAnyPermission: (...keys: PermissionKey[]) => boolean;
  isSuperAdmin: boolean;
  refetch: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  const { isAdmin, isAnyAdmin } = useUserRoles();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Super admin = has 'admin' role AND email matches known super admins
  // For now, super admin = admin role (all admins get full access, 
  // but delegated admins get scoped access via role_permissions)
  const isSuperAdmin = isAdmin; // Full admin role = super admin level

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const [permRes, allPermRes] = await Promise.all([
        supabase
          .from('role_permissions')
          .select('permission_key')
          .eq('user_id', user.id),
        supabase
          .from('permissions')
          .select('key, label, category'),
      ]);

      setPermissions((permRes.data || []).map(p => p.permission_key));
      setAllPermissions((allPermRes.data || []).map(p => ({
        key: p.key,
        label: p.label,
        category: p.category,
      })));
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((key: PermissionKey): boolean => {
    // Super admin (full admin role) has all permissions
    if (isAdmin) return true;
    // Admin readonly can view but not manage
    return permissions.includes(key);
  }, [isAdmin, permissions]);

  const hasAnyPermission = useCallback((...keys: PermissionKey[]): boolean => {
    if (isAdmin) return true;
    return keys.some(k => permissions.includes(k));
  }, [isAdmin, permissions]);

  return {
    permissions,
    allPermissions,
    loading,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin,
    refetch: fetchPermissions,
  };
};

export default usePermissions;
