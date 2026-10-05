import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SAAS_PLANS = ["BASICO", "PRO", "MASTER"] as const;
const MKT_PLANS = ["FREE", "PRO", "ELITE"] as const;
type SaasPlan = (typeof SAAS_PLANS)[number];
type MktPlan = (typeof MKT_PLANS)[number];

interface CompanyWithOwner {
  id: string;
  nome: string;
  email: string | null;
  owner_name: string | null;
  saas_plan: SaasPlan;
  mkt_plan: MktPlan;
  ativo: boolean;
  created_at: string | null;
}

interface PlanRow {
  id: string;
  nome: string;
  email: string | null;
  saas_plan: SaasPlan;
  mkt_plan: MktPlan;
  ativo: boolean;
  created_at: string | null;
  owner: { full_name: string | null }[] | null;
}

export function useCompaniesWithPlans() {
  return useQuery({
    queryKey: ["dev-plan-manager"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carcontrol_companies")
        .select(
          "id, nome, email, saas_plan, mkt_plan, ativo, created_at, owner:carcontrol_profiles!company_id(full_name)",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data ?? []) as unknown as PlanRow[]).map<CompanyWithOwner>(
        (row) => ({
          id: row.id,
          nome: row.nome,
          email: row.email,
          owner_name:
            row.owner && row.owner.length > 0
              ? row.owner[0].full_name
              : null,
          saas_plan: row.saas_plan,
          mkt_plan: row.mkt_plan,
          ativo: row.ativo,
          created_at: row.created_at,
        }),
      );
    },
  });
}

export function useUpdateSaasPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      plan,
    }: {
      companyId: string;
      plan: SaasPlan;
    }) => {
      const { error } = await supabase
        .from("carcontrol_companies")
        .update({ saas_plan: plan, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-plan-manager"] });
      toast.success("Plano SaaS alterado com sucesso!");
    },
    onError: (err) => {
      toast.error(
        `Erro ao alterar plano SaaS: ${(err as Error).message}`,
      );
    },
  });
}

export function useUpdateMktPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      plan,
    }: {
      companyId: string;
      plan: MktPlan;
    }) => {
      const { error } = await supabase
        .from("carcontrol_companies")
        .update({ mkt_plan: plan, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-plan-manager"] });
      toast.success("Plano Marketplace alterado com sucesso!");
    },
    onError: (err) => {
      toast.error(
        `Erro ao alterar plano Marketplace: ${(err as Error).message}`,
      );
    },
  });
}

export function useToggleCompanyActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      ativo,
    }: {
      companyId: string;
      ativo: boolean;
    }) => {
      const { error } = await supabase
        .from("carcontrol_companies")
        .update({ ativo, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dev-plan-manager"] });
      toast.success(
        variables.ativo
          ? "Empresa ativada com sucesso!"
          : "Empresa desativada com sucesso!",
      );
    },
    onError: (err) => {
      toast.error(
        `Erro ao alterar status: ${(err as Error).message}`,
      );
    },
  });
}

export type { SaasPlan, MktPlan, CompanyWithOwner };
export { SAAS_PLANS, MKT_PLANS };
