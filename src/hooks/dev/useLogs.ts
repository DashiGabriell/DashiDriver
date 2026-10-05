import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 20;

export interface AlertLog {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  severidade: string;
  data: string;
  created_at: string | null;
  company_id: string | null;
  empresa_nome: string | null;
}

export interface LogsOverview {
  total: number;
  critical: number;
  page: number;
  pageSize: number;
  totalPages: number;
  alerts: AlertLog[];
}

async function fetchCompanies(): Promise<Map<string, string>> {
  try {
    const { data } = await supabase
      .from("carcontrol_companies")
      .select("id, nome");
    const map = new Map<string, string>();
    if (data) {
      for (const c of data) {
        map.set(c.id, c.nome || "Sem nome");
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

async function fetchLogs(filters: {
  tipo?: string;
  severidade?: string;
  page?: number;
}): Promise<LogsOverview> {
  const page = filters.page ?? 1;
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  let query = supabase
    .from("carcontrol_alerts")
    .select("id, tipo, titulo, descricao, severidade, data, created_at, company_id")
    .order("created_at", { ascending: false })
    .range(start, end);

  if (filters.tipo && filters.tipo !== "all") {
    query = query.eq("tipo", filters.tipo);
  }
  if (filters.severidade && filters.severidade !== "all") {
    query = query.eq("severidade", filters.severidade);
  }

  let countQuery = supabase
    .from("carcontrol_alerts")
    .select("*", { count: "exact", head: true });

  let criticalQuery = supabase
    .from("carcontrol_alerts")
    .select("*", { count: "exact", head: true })
    .eq("severidade", "critico");

  if (filters.tipo && filters.tipo !== "all") {
    countQuery = countQuery.eq("tipo", filters.tipo);
    criticalQuery = criticalQuery.eq("tipo", filters.tipo);
  }
  if (filters.severidade && filters.severidade !== "all") {
    countQuery = countQuery.eq("severidade", filters.severidade);
    criticalQuery = criticalQuery.eq("severidade", filters.severidade);
  }

  const [alertsRes, totalRes, criticalRes, companyMap] = await Promise.all([
    query,
    countQuery,
    criticalQuery,
    fetchCompanies(),
  ]);

  if (alertsRes.error) throw alertsRes.error;

  const alerts = (alertsRes.data ?? []).map((a) => ({
    ...a,
    empresa_nome: companyMap.get(a.company_id ?? "") ?? null,
  })) as AlertLog[];

  const total = totalRes.count ?? 0;

  return {
    total,
    critical: criticalRes.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    alerts,
  };
}

export function useLogs(filters: {
  tipo?: string;
  severidade?: string;
  page?: number;
} = {}) {
  return useQuery<LogsOverview>({
    queryKey: ["dev-logs", filters],
    queryFn: () => fetchLogs(filters),
    staleTime: 1000 * 60,
  });
}
