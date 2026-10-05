import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("carcontrol_profiles")
        .select("id, company_id, role, plan, trial, has_used_free_trial")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {

        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
}
