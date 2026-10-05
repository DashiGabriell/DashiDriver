import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase.rpc("delete_company_cascade", {
        p_company_id: companyId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-companies"] });
      toast.success("Empresa e todos os dados vinculados foram excluídos.");
    },
    onError: (err) => {
      toast.error(`Erro ao excluir empresa: ${(err as Error).message}`);
    },
  });
}
