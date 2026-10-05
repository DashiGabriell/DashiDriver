import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export function useSaveOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (onboardingData: {
      role: "driver" | "marketplace_owner" | "fleet_management";
      nome: string;
      whatsapp: string;
      trial_intent?: boolean;
      plan?: string;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Mapeamento de roles para o banco de dados (ajustado para o tipo "user" | "admin" | "dev")
      const roleMapping: Record<string, string> = {
        driver: "user",
        marketplace_owner: "admin",
        fleet_management: "admin",
      };

      const { error } = await supabase
        .from("carcontrol_user")
        .update({
          nome: onboardingData.nome,
        })
        .eq("id", user.id);

      // Atualiza role e plano na tabela de perfis
      const { error: profileError } = await supabase
        .from("carcontrol_profiles")
        .update({
          role: roleMapping[onboardingData.role] || "user",
          plan: onboardingData.plan ?? (onboardingData.role === 'driver' ? 'motorista' : undefined),
          trial_intent: !!onboardingData.trial_intent,
        })
        .eq("id", user.id);

      // Chama a função RPC para ativar o trial se necessário
      if (onboardingData.trial_intent) {
        const { error: rpcError } = await supabase
          .rpc("activate_trial_onboarding", { 
            p_user_id: user.id,
            p_trial_intent: true 
          });
        
        if (rpcError) {

          throw new Error(`Falha ao ativar trial: ${rpcError.message}`);
        }
      }

      if (error || profileError) {
        throw new Error(`Falha ao salvar dados: ${(error || profileError)?.message}`);
      }

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["profile"] }),
        queryClient.refetchQueries({ queryKey: ["company"] }),
        queryClient.refetchQueries({ queryKey: ["accessControl"] }),
      ]);

      return { success: true };
    },
  });
}
