import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { maintenanceService, type Maintenance } from "@/integrations/supabase/services/maintenanceService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";

/**
 * Mobile maintenances list — shared maintenanceService (RLS scopes tenant).
 */
export function useMobileManutencao() {
  const [manutencoes, setManutencoes] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      setManutencoes([]);
      return;
    }

    let cancelled = false;

    const fetchManutencoes = async () => {
      try {
        setError(null);
        const data = await maintenanceService.list();
        if (!cancelled) setManutencoes(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Erro ao carregar manutenções"));
          setManutencoes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchManutencoes();

    const channel = supabase
      .channel(`manutencoes:${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "carcontrol_maintenances" },
        () => {
          if (!cancelled) fetchManutencoes();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  return { manutencoes, loading, error };
}
