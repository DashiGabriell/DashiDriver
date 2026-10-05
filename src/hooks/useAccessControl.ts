import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { evaluateAccessControl } from "@/lib/access/evaluateAccessControl";

export function useAccessControl() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["accessControl", user?.id],
    queryFn: async () => {
      if (!user) {
        return evaluateAccessControl(null, false);
      }

      const { data: profile, error: profileError } = await supabase
        .from("carcontrol_profiles")
        .select("trial, company_id, created_at, status, plano_ativo")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        return evaluateAccessControl(null, false);
      }

      let companyAtivo = false;
      if (profile.company_id) {
        const { data: company, error: companyError } = await supabase
          .from("carcontrol_companies")
          .select("ativo")
          .eq("id", profile.company_id)
          .single();

        if (companyError) throw companyError;
        companyAtivo = company.ativo;
      }

      // Motoristas: não têm company_id → 'onboarding_incomplete'
      //             ou têm company_id (convidados) mas plano_ativo é sempre null → 'trial_expired'
      //             'payment_pending' NUNCA se aplica a motoristas, pois eles não têm planos pagos
      return evaluateAccessControl(profile, companyAtivo);
    },
    enabled: !!user,
  });
}
