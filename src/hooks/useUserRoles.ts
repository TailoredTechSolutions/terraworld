import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = 'farmer' | 'business_buyer' | 'member' | 'driver' | 'admin' | 'buyer' | 'affiliate' | 'admin_readonly';

interface UseUserRolesReturn {
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isAdminReadonly: boolean;
  isAnyAdmin: boolean;
  isDriver: boolean;
  isFarmer: boolean;
  isMember: boolean;
  isBuyer: boolean;
  isAffiliate: boolean;
  refetch: () => Promise<void>;
}

export const useUserRoles = (): UseUserRolesReturn => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = (data || []).map(r => r.role as AppRole);
      setRoles(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [user?.id]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = roles.includes('admin');
  const isAdminReadonly = roles.includes('admin_readonly');
  const isAnyAdmin = isAdmin || isAdminReadonly;

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isAdminReadonly,
    isAnyAdmin,
    isDriver: roles.includes('driver'),
    isFarmer: roles.includes('farmer'),
    isMember: roles.includes('member'),
    isBuyer: roles.includes('buyer'),
    isAffiliate: roles.includes('affiliate'),
    refetch: fetchRoles,
  };
};

export default useUserRoles;
