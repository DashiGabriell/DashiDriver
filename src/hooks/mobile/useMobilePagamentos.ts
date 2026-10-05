import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { paymentService, type EnrichedPayment } from "@/integrations/supabase/services/paymentService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";

/**
 * Mobile payments list — same domain logic as desktop via paymentService.
 * Realtime refreshes the shared enriched list (RLS scopes tenant).
 */
export function useMobilePagamentos() {
  const [pagamentos, setPagamentos] = useState<EnrichedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      setPagamentos([]);
      return;
    }

    let cancelled = false;

    const fetchPagamentos = async () => {
      try {
        setError(null);
        const enriched = await paymentService.listEnriched();
        if (!cancelled) setPagamentos(enriched);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Erro ao carregar pagamentos"));
          setPagamentos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPagamentos();

    const channel = supabase
      .channel(`pagamentos:${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "carcontrol_payments" },
        () => {
          if (!cancelled) fetchPagamentos();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  return { pagamentos, loading, error };
}
