import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistImageDetails() {
  const queryClient = useQueryClient();

  const updateDetails = useMutation({
    mutationFn: async ({
      imageId,
      details,
      notes,
    }: {
      imageId: string;
      details: string;
      notes: string;
    }) => {
      const { error } = await supabase
        .from("carcontrol_checklist_images")
        .update({
          details: details || null,
          notes: notes || null,
        })
        .eq("id", imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      queryClient.invalidateQueries({ queryKey: ["checklistImages"] });
      toast.success("Detalhes salvos com sucesso!");
    },
    onError: (error) => {

      toast.error("Erro ao salvar detalhes da foto");
    },
  });

  return {
    updateDetails: updateDetails.mutate,
    updateDetailsAsync: updateDetails.mutateAsync,
    isUpdating: updateDetails.isPending,
    error: updateDetails.error,
  };
}
