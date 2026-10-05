import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_PROJECT } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface EventItem {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  severidade: string;
  data: string;
  created_at: string | null;
}

const TIPO_LABELS: Record<string, string> = {
  pagamento: "Pagamento",
  seguro: "Seguro",
  manutencao: "Manutenção",
  documento: "Documento",
  contrato: "Contrato",
  ocioso: "Ocioso",
  sistema: "Sistema",
};

const SEVERIDADE_CONFIG: Record<string, { label: string; color: string }> = {
  info: { label: "Info", color: "bg-blue-500" },
  atencao: { label: "Atenção", color: "bg-yellow-500" },
  critico: { label: "Crítico", color: "bg-red-500" },
};

function getTipoLabel(tipo: string): string {
  return TIPO_LABELS[tipo] || tipo;
}

function getSeveridadeConfig(severidade: string) {
  return (
    SEVERIDADE_CONFIG[severidade] || {
      label: severidade,
      color: "bg-zinc-500",
    }
  );
}

async function fetchViaEdge(
  token: string,
  filters: { tipo?: string; severidade?: string; limit?: number },
): Promise<EventItem[]> {
  const params = new URLSearchParams();
  if (filters.tipo && filters.tipo !== "all") params.set("tipo", filters.tipo);
  if (filters.severidade && filters.severidade !== "all") {
    params.set("severidade", filters.severidade);
  }
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();

  const response = await fetch(
    `${SUPABASE_PROJECT.url}/functions/v1/admin-events${qs ? `?${qs}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_PROJECT.anonKey,
      },
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchViaClient(filters: {
  tipo?: string;
  severidade?: string;
  limit?: number;
}): Promise<EventItem[]> {
  const limit = Math.min(filters.limit ?? 50, 200);

  let q = supabase
    .from("carcontrol_alerts")
    .select("id, tipo, titulo, descricao, severidade, data, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.tipo && filters.tipo !== "all") q = q.eq("tipo", filters.tipo);
  if (filters.severidade && filters.severidade !== "all") {
    q = q.eq("severidade", filters.severidade);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message || "Erro ao carregar eventos");
  return (data ?? []) as EventItem[];
}

/** Dev events — Edge Function first, direct table fallback (same as /dev/logs). */
export function useEvents(
  filters: {
    tipo?: string;
    severidade?: string;
    limit?: number;
  } = {},
) {
  const queryClient = useQueryClient();
  const queryKey = ["dev-events", filters];

  const query = useQuery<EventItem[]>({
    queryKey,
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Sessao expirada");

      try {
        return await fetchViaEdge(token, filters);
      } catch (edgeErr) {
        console.warn("[events] edge function falhou, tentando client:", edgeErr);
        return fetchViaClient(filters);
      }
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`dev-events-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "carcontrol_alerts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dev-events"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, filters.tipo, filters.severidade]);

  return query;
}

export { getTipoLabel, getSeveridadeConfig };
