import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase.rpc("delete_vehicle_cascade", {
        p_vehicle_id: vehicleId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-veiculos"] });
      toast.success("Veículo e todos os registros vinculados foram excluídos.");
    },
    onError: (err) => {
      toast.error(`Erro ao excluir veículo: ${(err as Error).message}`);
    },
  });
}
