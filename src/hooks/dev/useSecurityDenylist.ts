import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DenylistEntry {
  id: string;
  ip_address: string | null;
  user_id: string | null;
  reason: string;
  blocked_by: string;
  blocked_at: string;
  expires_at: string | null;
}

export function useSecurityDenylist() {
  return useQuery({
    queryKey: ["dev-security"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_denylist")
        .select("*")
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as DenylistEntry[];
    },
    staleTime: 1000 * 60 * 2,
  });
}
