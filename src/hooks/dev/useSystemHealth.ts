import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceStatus = "online" | "degraded" | "offline";

export interface TableHealth {
  table: string;
  count: number | null;
  status: ServiceStatus;
  error: string | null;
  latencyMs: number | null;
}

export interface SystemHealth {
  overall: ServiceStatus;
  lastSyncAt: string;
  dbLatencyMs: number | null;
  tables: TableHealth[];
  activeCompanies: number;
  totalCompanies: number;
  activeDrivers: number;
  totalDrivers: number;
}

const MONITORED_TABLES = [
  // Core
  "carcontrol_companies",
  "carcontrol_profiles",
  "carcontrol_vehicles",
  "carcontrol_drivers",
  "carcontrol_payments",
  "carcontrol_payment_schedules",
  "carcontrol_parcela_seguro_payments",
  "carcontrol_parcela_seguro_schedules",
  "carcontrol_maintenances",
  "carcontrol_alerts",
  "carcontrol_checklists",
  "carcontrol_checklist_images",
  "carcontrol_notification_preferences",
  // Marketplace
  "marketplace_categories",
  "marketplace_seller_profiles",
  "marketplace_listings",
  "marketplace_listing_images",
  "marketplace_listing_specs",
  "marketplace_wishlist",
  "marketplace_proposals",
  "marketplace_reviews",
  "marketplace_inspections",
  "marketplace_search_logs",
  "marketplace_whatsapp_clicks",
  // System
  "notifications",
  "payments",
  "coupons",
  "feature_flags",
  "dashidrive_webhook_leads",
  "company_invites",
  "checklist_share_tokens",
  // Security
  "security_denylist",
] as const;

async function pingTable(table: string): Promise<TableHealth> {
  const start = performance.now();
  try {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return {
        table,
        count: null,
        status: "offline",
        error: error.message,
        latencyMs,
      };
    }

    return {
      table,
      count: count ?? 0,
      status: latencyMs > 1500 ? "degraded" : "online",
      error: null,
      latencyMs,
    };
  } catch (err) {
    return {
      table,
      count: null,
      status: "offline",
      error: err instanceof Error ? err.message : "Erro desconhecido",
      latencyMs: null,
    };
  }
}

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ["dev-system-health"],
    queryFn: async () => {
      const dbStart = performance.now();
      const overallPing = await supabase
        .from("carcontrol_companies")
        .select("id", { count: "exact", head: true });
      const dbLatencyMs = Math.round(performance.now() - dbStart);

      const tables = await Promise.all(MONITORED_TABLES.map(pingTable));

      const activeCompanies =
        tables.find((t) => t.table === "carcontrol_companies")?.count ?? 0;
      const totalDriversCount =
        tables.find((t) => t.table === "carcontrol_drivers")?.count ?? 0;

      let activeDrivers = 0;
      if (totalDriversCount > 0) {
        const { count } = await supabase
          .from("carcontrol_drivers")
          .select("*", { count: "exact", head: true })
          .eq("status", "ativo");
        activeDrivers = count ?? 0;
      }

      const offline = tables.filter((t) => t.status === "offline").length;
      const degraded = tables.filter((t) => t.status === "degraded").length;
      const overall: ServiceStatus = overallPing.error
        ? "offline"
        : offline > 0
          ? "offline"
          : degraded > 0
            ? "degraded"
            : "online";

      return {
        overall,
        lastSyncAt: new Date().toISOString(),
        dbLatencyMs: overallPing.error ? null : dbLatencyMs,
        tables,
        activeCompanies: activeCompanies ?? 0,
        totalCompanies: activeCompanies ?? 0,
        activeDrivers,
        totalDrivers: totalDriversCount ?? 0,
      };
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
