import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { vehicleService } from "@/integrations/supabase/services/vehicleService";

/** Shared desktop + mobile vehicles list. */
export function useVehiclesList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vehicles-list", user?.id],
    queryFn: () => vehicleService.list(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}
