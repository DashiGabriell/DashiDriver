import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { maintenanceService } from "@/integrations/supabase/services/maintenanceService";

/** Shared maintenances list (desktop + mobile). */
export function useMaintenancesList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["maintenances-list", user?.id],
    queryFn: () => maintenanceService.list(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}
