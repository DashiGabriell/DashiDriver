import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChecklistImage {
  id: string;
  step_key: string;
  step_label: string;
  step_order: number;
  image_url: string;
  thumbnail_url: string;
  watermarked_url: string;
  position: number;
  taken_at: string;
  odometro_km?: number;
  details?: string | null;
}

export interface ChecklistDetailData {
  checklist_id: string;
  company_id: string;
  vehicle_id: string;
  vehicle_placa: string;
  vehicle_modelo: string;
  driver_name: string | null;
  type: string;
  status: string;
  total_images: number;
  images: ChecklistImage[];
  started_at: string;
  finished_at: string | null;
  notes: string | null;
}

export function useChecklistDetail(checklistId: string | undefined) {
  return useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) throw new Error("ID do checklist não fornecido");

      const { data, error } = await supabase.rpc("get_checklist_with_images", {
        p_checklist_id: checklistId,
      });

      if (error) throw error;
      return data?.[0] as ChecklistDetailData;
    },
    enabled: !!checklistId,
  });
}
