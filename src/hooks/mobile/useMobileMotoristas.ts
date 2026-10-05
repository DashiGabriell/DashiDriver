import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { driverService, type DriverWithVehicle } from "@/integrations/supabase/services/driverService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";

/**
 * Mobile drivers list — shared driverService (RLS scopes tenant).
 */
export function useMobileMotoristas() {
  const [motoristas, setMotoristas] = useState<DriverWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      setMotoristas([]);
      return;
    }

    let cancelled = false;

    const fetchMotoristas = async () => {
      try {
        setError(null);
        const data = await driverService.listWithVehicle();
        if (!cancelled) setMotoristas(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Erro ao carregar motoristas"));
          setMotoristas([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMotoristas();

    const channel = supabase
      .channel(`motoristas:${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "carcontrol_drivers" },
        () => {
          if (!cancelled) fetchMotoristas();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  return { motoristas, loading, error };
}
