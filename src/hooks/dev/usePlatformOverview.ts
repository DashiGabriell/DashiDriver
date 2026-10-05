import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SystemStatus = "online" | "degraded" | "offline";

export interface ActivityItem {
  type: "company" | "user" | "alert";
  timestamp: string;
  message: string;
}

export interface PlatformOverview {
  empresas: number;
  usuarios: number;
  veiculos: number;
  motoristas: number;
  empresasAtivas: number;
  pagamentosAtrasados: number;
  receitaMes: number;
  systemStatus: SystemStatus;
  lastSyncAt: string;
  recentActivity: ActivityItem[];
}

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

export function usePlatformOverview() {
  return useQuery<PlatformOverview>({
    queryKey: ["platform-overview"],
    queryFn: async () => {
      const monthStart = startOfMonthIso();

      const [
        companiesRes,
        usersRes,
        vehiclesRes,
        driversRes,
        activeCompaniesRes,
        overdueRes,
        revenueRes,
        recentCompaniesRes,
        recentUsersRes,
      ] = await Promise.all([
        supabase
          .from("carcontrol_companies")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_profiles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_vehicles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_drivers")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("carcontrol_companies")
          .select("*", { count: "exact", head: true })
          .eq("ativo", true),
        supabase
          .from("carcontrol_payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "atrasado"),
        supabase
          .from("carcontrol_payments")
          .select("valor")
          .eq("status", "pago")
          .gte("data", monthStart),
        supabase
          .from("carcontrol_companies")
          .select("id, nome, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("carcontrol_profiles")
          .select("id, full_name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const fatal = [
        companiesRes,
        usersRes,
        vehiclesRes,
        driversRes,
      ].find((r) => r.error);
      if (fatal?.error) throw fatal.error;

      const degraded = !!(activeCompaniesRes.error || overdueRes.error || revenueRes.error);

      const receitaMes = (revenueRes.data ?? []).reduce(
        (acc, p) => acc + (Number(p.valor) || 0),
        0,
      );

      const recentActivity: ActivityItem[] = [];

      for (const company of recentCompaniesRes.data ?? []) {
        if (!company.created_at) continue;
        recentActivity.push({
          type: "company",
          timestamp: company.created_at,
          message: `Nova empresa cadastrada: ${company.nome}`,
        });
      }

      for (const user of recentUsersRes.data ?? []) {
        if (!user.created_at) continue;
        const label = user.full_name?.trim() || user.email || "novo usuário";
        recentActivity.push({
          type: "user",
          timestamp: user.created_at,
          message: `Novo perfil criado: ${label}`,
        });
      }

      recentActivity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      return {
        empresas: companiesRes.count ?? 0,
        usuarios: usersRes.count ?? 0,
        veiculos: vehiclesRes.count ?? 0,
        motoristas: driversRes.count ?? 0,
        empresasAtivas: activeCompaniesRes.count ?? 0,
        pagamentosAtrasados: overdueRes.count ?? 0,
        receitaMes,
        systemStatus: degraded ? "degraded" : "online",
        lastSyncAt: new Date().toISOString(),
        recentActivity: recentActivity.slice(0, 8),
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
