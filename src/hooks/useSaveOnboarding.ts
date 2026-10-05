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

      // Motorista não tem plano pago nem trial, mesmo que tenha escolhido um antes de voltar no funil
      const isDriver = onboardingData.role === "driver";
      const plan = isDriver ? "motorista" : onboardingData.plan;
      const trialIntent = !isDriver && !!onboardingData.trial_intent;

      const { error } = await supabase
        .from("carcontrol_user")
        .update({
          nome: onboardingData.nome,
        })
        .eq("id", user.id);

      if (error) {
        throw new Error(`Falha ao salvar dados: ${error.message}`);
      }

      // carcontrol_profiles não tem coluna própria para WhatsApp
      const { data: currentProfile, error: readError } = await supabase
        .from("carcontrol_profiles")
        .select("preferencias")
        .eq("id", user.id)
        .maybeSingle();

      if (readError) {
        throw new Error(`Falha ao salvar dados: ${readError.message}`);
      }

      const preferencias = {
        ...((currentProfile?.preferencias as Record<string, unknown> | null) ?? {}),
        whatsapp: onboardingData.whatsapp,
      };

      // Atualiza role, plano e WhatsApp na tabela de perfis
      const { error: profileError } = await supabase
        .from("carcontrol_profiles")
        .update({
          role: roleMapping[onboardingData.role] || "user",
          plan,
          trial_intent: trialIntent,
          preferencias,
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(`Falha ao salvar dados: ${profileError.message}`);
      }

      // Só ativa o trial depois que perfil e plano foram gravados
      if (trialIntent) {
        const { error: rpcError } = await supabase
          .rpc("activate_trial_onboarding", {
            p_user_id: user.id,
            p_trial_intent: true
          });

        if (rpcError) {
          throw new Error(`Falha ao ativar trial: ${rpcError.message}`);
        }
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
