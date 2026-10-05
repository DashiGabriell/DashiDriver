import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/integrations/supabase/auth";
import { checklistService } from "@/integrations/supabase/services/checklistService";

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  vehicle_placa: string | null;
  vehicle_modelo: string | null;
  driver_name: string | null;
  motorista_nome?: string | null;
  type: string;
  status: string;
  total_images: number;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
}

/** Shared desktop + mobile checklist list (single query source). */
export function useChecklistsList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["checklists-list", user?.id],
    queryFn: async () => (await checklistService.listDetailed()) as ChecklistItem[],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}
