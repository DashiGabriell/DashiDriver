import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { paymentService } from "@/integrations/supabase/services/paymentService";

/** Shared enriched payments list (desktop + mobile). */
export function usePaymentsList(enriched = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payments-list", user?.id, enriched ? "enriched" : "raw"],
    queryFn: () => (enriched ? paymentService.listEnriched() : paymentService.list()),
    enabled: !!user?.id,
    staleTime: 1000 * 60,
  });
}
