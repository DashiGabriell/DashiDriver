/**
 * Hook para Gerenciamento de Empresas (Multi-Tenant)
 * 
 * Gerencia a empresa do usuário logado e operações relacionadas
 * 
 * @author Squad Dashi
 * @date 2026-05-04
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface Company {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  saas_plan: "BASICO" | "PRO" | "MASTER";
  mkt_plan: "FREE" | "PRO" | "ELITE";
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyFormData {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  plan?: string;
}

/**
 * Hook para obter a empresa do usuário atual
 */
export function useCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["company", user?.id],
    queryFn: async (): Promise<Company | null> => {
      if (!user) return null;

      // Buscar company_id do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("carcontrol_profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {

        throw profileError;
      }

      if (!profile?.company_id) {
        return null; // Usuário não tem perfil ou empresa
      }

      // Buscar dados da empresa
      const { data: company, error: companyError } = await supabase
        .from("carcontrol_companies")
        .select("*")
        .eq("id", profile.company_id)
        .maybeSingle();

      if (companyError) {

        throw companyError;
      }

      if (!company) {
        return null;
      }

      return company;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    retry: 1,
  });
}

/**
 * Hook para criar uma nova empresa e vincular ao usuário
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyData: CompanyFormData) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Mapeamento de plano para o padrão do banco
      const planMapping: Record<string, "BASICO" | "PRO" | "MASTER"> = {
        'gestao-basico': 'BASICO',
        'gestao-pro': 'PRO',
        'gestao-master': 'MASTER',
      };

      // 1. Criar empresa
      const isTrial = companyData.plan === 'free7dias' || companyData.plan === 'trial';
      const saasPlan = companyData.plan ? planMapping[companyData.plan] ?? 'BASICO' : 'BASICO';
      
      const { data: company, error: companyError } = await supabase
        .from("carcontrol_companies")
        .insert({
          nome: companyData.nome,
          cnpj: companyData.cnpj || null,
          email: companyData.email || null,
          telefone: companyData.telefone || null,
          endereco: companyData.endereco || null,
          ativo: isTrial, // Ativo apenas se for trial
          trial: isTrial ? 'ativo' : null,
          saas_plan: saasPlan,
        } as any)
        .select()
        .single();

      if (companyError) {

        throw new Error(`Falha ao criar empresa: ${companyError.message}`);
      }

      // 2. Vincular empresa ao perfil do usuário (tornar admin)
      const { error: profileError } = await supabase
        .from("carcontrol_profiles")
        .update({
          company_id: company.id,
          role: "admin", // Primeiro usuário é admin
        })
        .eq("id", user.id);

      if (profileError) {

        throw new Error(`Falha ao vincular empresa: ${profileError.message}`);
      }

      return company;
    },
    onSuccess: () => {
      // Invalidar cache da empresa e perfil
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["accessControl"] });
    },
  });
}

/**
 * Hook para atualizar dados da empresa
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      companyId,
      updates,
    }: {
      companyId: string;
      updates: Partial<CompanyFormData>;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("carcontrol_companies")
        .update(updates)
        .eq("id", companyId)
        .select()
        .single();

      if (error) {

        throw new Error(`Falha ao atualizar empresa: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

/**
 * Hook para verificar se usuário tem empresa
 * Ãštil para route guards
 */
export function useHasCompany() {
  const { data: company, isLoading } = useCompany();

  return {
    hasCompany: !!company,
    company,
    isLoading,
  };
}
