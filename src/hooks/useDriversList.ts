import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { driverService } from "@/integrations/supabase/services/driverService";

/** Shared desktop + mobile drivers list. */
export function useDriversList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["drivers-list", user?.id],
    queryFn: () => driverService.listWithVehicle(),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}
