import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MonthBucket {
  month: string;
  label: string;
  count: number;
  receita: number;
}

export interface CompanyGrowth {
  totalCompanies: number;
  buckets: MonthBucket[];
}

export interface AlertsDistribution {
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  total: number;
  unresolved: number;
}

export interface DriverStatus {
  ativo: number;
  atrasado: number;
  encerrado: number;
}

export interface TopCompany {
  id: string;
  nome: string;
  vehicles: number;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalPayments: number;
  totalAlerts: number;
  totalDrivers: number;
  companyGrowth: CompanyGrowth;
  alertsDistribution: AlertsDistribution;
  driverStatus: DriverStatus;
  topCompanies: TopCompany[];
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function buildLastSixMonths(): { key: string; label: string; date: Date }[] {
  const today = new Date();
  const months: { key: string; label: string; date: Date }[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    months.push({ key: monthKey(date), label: monthLabel(date), date });
  }
  return months;
}

const ALLOWED_TYPES = [
  "pagamento",
  "seguro",
  "manutencao",
  "documento",
  "contrato",
  "ocioso",
  "sistema",
] as const;

const ALLOWED_SEVERITIES = ["info", "atencao", "critico"] as const;

function emptyDistribution<T extends string>(keys: readonly T[]): Record<T, number> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ["dev-analytics-overview"],
    queryFn: async () => {
      const months = buildLastSixMonths();
      const oldestIso = months[0].date.toISOString().slice(0, 10);

      const [
        companiesRes,
        vehiclesRes,
        driversRes,
        alertsRes,
        paymentsRes,
        recentCompaniesRes,
        alertsByTypeRes,
        alertsBySeverityRes,
        alertsUnresolvedRes,
        driversByStatusRes,
      ] = await Promise.all([
        supabase
          .from("carcontrol_companies")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_vehicles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_drivers")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_alerts")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_payments")
          .select("valor, status, data"),
        supabase
          .from("carcontrol_companies")
          .select("id, nome, created_at")
          .gte("created_at", oldestIso),
        supabase.from("carcontrol_alerts").select("tipo"),
        supabase.from("carcontrol_alerts").select("severidade"),
        supabase
          .from("carcontrol_alerts")
          .select("*", { count: "exact", head: true })
          .eq("resolvido", false),
        supabase.from("carcontrol_drivers").select("status"),
      ]);

      if (companiesRes.error) throw companiesRes.error;
      if (vehiclesRes.error) throw vehiclesRes.error;
      if (driversRes.error) throw driversRes.error;
      if (alertsRes.error) throw alertsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      const totalRevenue = (paymentsRes.data ?? [])
        .filter((p) => p.status === "pago")
        .reduce((acc, p) => acc + (Number(p.valor) || 0), 0);

      const monthCountMap = new Map<string, number>();
      const monthRevenueMap = new Map<string, number>();
      for (const m of months) {
        monthCountMap.set(m.key, 0);
        monthRevenueMap.set(m.key, 0);
      }
      for (const company of recentCompaniesRes.data ?? []) {
        if (!company.created_at) continue;
        const key = monthKey(new Date(company.created_at));
        monthCountMap.set(key, (monthCountMap.get(key) ?? 0) + 1);
      }
      for (const payment of paymentsRes.data ?? []) {
        if (payment.status !== "pago" || !payment.data) continue;
        const key = monthKey(new Date(payment.data));
        if (!monthCountMap.has(key)) continue;
        monthRevenueMap.set(
          key,
          (monthRevenueMap.get(key) ?? 0) + (Number(payment.valor) || 0),
        );
      }
      const buckets: MonthBucket[] = months.map((m) => ({
        month: m.key,
        label: m.label,
        count: monthCountMap.get(m.key) ?? 0,
        receita: monthRevenueMap.get(m.key) ?? 0,
      }));

      const byType = emptyDistribution(ALLOWED_TYPES);
      for (const row of alertsByTypeRes.data ?? []) {
        const tipo = row.tipo as keyof typeof byType;
        if (tipo) byType[tipo] += 1;
      }

      const bySeverity = emptyDistribution(ALLOWED_SEVERITIES);
      for (const row of alertsBySeverityRes.data ?? []) {
        const sev = row.severidade as keyof typeof bySeverity;
        if (sev) bySeverity[sev] += 1;
      }

      const driverStatus: DriverStatus = {
        ativo: 0,
        atrasado: 0,
        encerrado: 0,
      };
      for (const row of driversByStatusRes.data ?? []) {
        if (row.status in driverStatus) {
          driverStatus[row.status as keyof DriverStatus] += 1;
        }
      }

      const topCompanies: TopCompany[] = (recentCompaniesRes.data ?? [])
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          nome: c.nome,
          vehicles: 0,
        }));

      return {
        totalRevenue,
        totalPayments: (paymentsRes.data ?? []).length,
        totalAlerts: alertsRes.count ?? 0,
        totalDrivers: driversRes.count ?? 0,
        companyGrowth: {
          totalCompanies: companiesRes.count ?? 0,
          buckets,
        },
        alertsDistribution: {
          byType,
          bySeverity,
          total: alertsRes.count ?? 0,
          unresolved: alertsUnresolvedRes.count ?? 0,
        },
        driverStatus,
        topCompanies,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
