/**
 * Hook para Dashboard KPIs - Backend Calculations
 * 
 * Substitui os cálculos do frontend (generateOccurrences + loops)
 * por chamadas RPC otimizadas no PostgreSQL.
 * 
 * @author Squad Dashi
 * @date 2026-05-04
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DashboardKPIs {
  pagamentos_atrasados: number;
  receita_estimada: number;
  a_receber: number;
  custo_total_estimado: number;
  lucro_estimado: number;
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
}

/**
 * Hook para buscar KPIs da Dashboard calculados no backend
 * 
 * @param dateRange - Período para cálculo dos KPIs
 * @returns Query com dados dos KPIs
 * 
 * @example
 * ```tsx
 * const { data: kpis, isLoading } = useDashboardKPIs(dateRange);
 * 
 * if (isLoading) return <Loader />;
 * 
 * return (
 *   <div>
 *     <StatCard label="Pagamentos Atrasados" value={kpis.pagamentos_atrasados} />
 *     <StatCard label="Receita Estimada" value={fmtBRL(kpis.receita_estimada)} />
 *   </div>
 * );
 * ```
 */
export function useDashboardKPIs(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ["dashboard-kpis", dateRange?.from, dateRange?.to],
    queryFn: async (): Promise<DashboardKPIs> => {
      // Validar período
      if (!dateRange?.from) {
        throw new Error("Período inválido: data inicial não definida");
      }

      // Formatar datas para PostgreSQL (YYYY-MM-DD)
      const dateFrom = format(dateRange.from, "yyyy-MM-dd");
      const dateTo = dateRange.to 
        ? format(dateRange.to, "yyyy-MM-dd")
        : format(dateRange.from, "yyyy-MM-dd");

      // Chamar função RPC do PostgreSQL
      const { data, error } = await supabase.rpc("get_dashboard_kpis", {
        p_date_from: dateFrom,
        p_date_to: dateTo,
      });

      if (error) {

        throw new Error(`Falha ao calcular KPIs: ${error.message}`);
      }

      if (!data) {
        throw new Error("Nenhum dado retornado pela função RPC");
      }

      return data as DashboardKPIs;
    },
    // Cache por 2 minutos (KPIs não mudam com frequência)
    staleTime: 1000 * 60 * 2,
    // Manter cache por 5 minutos
    gcTime: 1000 * 60 * 5,
    // Não refetch automaticamente ao focar janela
    refetchOnWindowFocus: false,
    // Retry apenas 1 vez em caso de erro
    retry: 1,
    // Habilitar query apenas se houver período válido
    enabled: !!dateRange?.from,
  });
}

/**
 * Hook para buscar KPIs com valores padrão em caso de erro
 * 
 * Ãštil para evitar quebra da UI quando há problemas de conexão
 */
export function useDashboardKPIsWithFallback(dateRange: DateRange | undefined) {
  const query = useDashboardKPIs(dateRange);

  const defaultKPIs: DashboardKPIs = {
    pagamentos_atrasados: 0,
    receita_estimada: 0,
    a_receber: 0,
    custo_total_estimado: 0,
    lucro_estimado: 0,
    periodo: {
      data_inicio: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      data_fim: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
    },
  };

  return {
    ...query,
    data: query.data || defaultKPIs,
  };
}
