import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScanLogEntry {
  id: string;
  started_at: string;
  finished_at: string | null;
  triggered_by: string;
  status: string;
  threats_detected: number;
  blocks_inserted: number;
  audit_logs_analyzed: number;
  summary: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
}

export function useSecurityScanLog() {
  return useQuery({
    queryKey: ["dev-security-scan-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_scan_log")
        .select("*")
        .order("started_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ScanLogEntry[];
    },
    staleTime: 1000 * 60 * 2,
  });
}
