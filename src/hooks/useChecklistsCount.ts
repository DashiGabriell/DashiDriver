import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

/**
 * Hook para obter a quantidade de checklists criados pelo usuário
 * Segue os padrões do Squad Dashi:
 * - React Query para cache e sincronização
 * - Tipagem forte com TypeScript
 * - Tratamento de erros robusto
 */
export function useChecklistsCount() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["checklists-count", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }

      // Obter company_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from("carcontrol_profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile?.company_id) {
        throw new Error("Empresa não encontrada");
      }

      // Contar checklists da empresa
      const { count, error } = await supabase
        .from("carcontrol_checklists")
        .select("*", { count: "exact", head: true })
        .eq("company_id", profile.company_id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
}
