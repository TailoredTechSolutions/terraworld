import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SystemToggle {
  id: string;
  feature_key: string;
  is_enabled: boolean;
  label: string;
  description: string | null;
}

export const useSystemToggles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: toggles = [], isLoading } = useQuery({
    queryKey: ["system-toggles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_toggles")
        .select("*")
        .order("feature_key");
      if (error) throw error;
      return data as SystemToggle[];
    },
    enabled: !!user,
  });

  const updateToggle = useMutation({
    mutationFn: async ({ featureKey, isEnabled }: { featureKey: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from("system_toggles")
        .update({ is_enabled: isEnabled, updated_by: user?.id, updated_at: new Date().toISOString() })
        .eq("feature_key", featureKey);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-toggles"] });
    },
  });

  const isFeatureEnabled = (key: string): boolean => {
    const toggle = toggles.find(t => t.feature_key === key);
    return toggle?.is_enabled ?? true;
  };

  return { toggles, isLoading, updateToggle, isFeatureEnabled };
};
