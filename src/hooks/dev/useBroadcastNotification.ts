import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BroadcastInput {
  type: string;
  category: string;
  title: string;
  message: string;
  actionUrl?: string;
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async (input: BroadcastInput) => {
      const { data, error } = await (supabase as any).rpc("broadcast_notification", {
        p_type: input.type,
        p_category: input.category,
        p_title: input.title,
        p_message: input.message,
        p_action_url: input.actionUrl ?? null,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      toast.success(`Notificação enviada para ${count} usuário${count !== 1 ? "s" : ""}.`);
    },
    onError: (err) => {
      toast.error(`Erro ao enviar notificação: ${(err as Error).message}`);
    },
  });
}
