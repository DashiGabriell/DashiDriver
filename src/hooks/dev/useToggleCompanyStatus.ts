import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useToggleCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, ativo }: { companyId: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("carcontrol_companies")
        .update({ ativo })
        .eq("id", companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-companies"] });
      toast.success("Status da empresa atualizado.");
    },
    onError: (err) => {
      toast.error(`Erro ao alterar status: ${(err as Error).message}`);
    },
  });
}
