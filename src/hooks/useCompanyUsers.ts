/**
 * Hook para Gerenciamento de Usuários da Empresa
 * 
 * Gerencia os usuários que pertencem à mesma empresa
 * 
 * @author Squad Dashi
 * @date 2026-05-04
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export interface CompanyUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin" | "dev";
  company_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para listar todos os usuários da empresa
 */
export function useCompanyUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["company-users", user?.id],
    queryFn: async (): Promise<CompanyUser[]> => {
      if (!user) return [];

      // Buscar company_id do usuário atual
      const { data: profile, error: profileError } = await supabase
        .from("carcontrol_profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.company_id) {

        return [];
      }

      // Buscar todos os usuários da mesma empresa
      const { data: users, error: usersError } = await supabase
        .from("carcontrol_profiles")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (usersError) {

        throw usersError;
      }

      return users || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
  });
}

/**
 * Hook para atualizar role de um usuário
 * Apenas admins podem usar
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: "user" | "admin" | "dev";
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar se o usuário atual é admin
      const { data: currentProfile } = await supabase
        .from("carcontrol_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (currentProfile?.role !== "admin" && currentProfile?.role !== "dev") {
        throw new Error("Apenas administradores podem alterar roles");
      }

      // Atualizar role
      const { data, error } = await supabase
        .from("carcontrol_profiles")
        .update({ role: newRole })
        .eq("id", userId)
        .select()
        .single();

      if (error) {

        throw new Error(`Falha ao atualizar role: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
  });
}

/**
 * Hook para remover usuário da empresa
 * Apenas admins podem usar
 */
export function useRemoveUserFromCompany() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar se o usuário atual é admin
      const { data: currentProfile } = await supabase
        .from("carcontrol_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (currentProfile?.role !== "admin" && currentProfile?.role !== "dev") {
        throw new Error("Apenas administradores podem remover usuários");
      }

      // Não permitir remover a si mesmo
      if (userId === user.id) {
        throw new Error("Você não pode remover a si mesmo");
      }

      // Remover company_id do usuário (desvincula da empresa)
      const { error } = await supabase
        .from("carcontrol_profiles")
        .update({ company_id: null, role: "user" })
        .eq("id", userId);

      if (error) {

        throw new Error(`Falha ao remover usuário: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
  });
}

/**
 * Hook para obter estatísticas dos usuários
 */
export function useCompanyUsersStats() {
  const { data: users = [] } = useCompanyUsers();

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    regularUsers: users.filter((u) => u.role === "user").length,
    devs: users.filter((u) => u.role === "dev").length,
  };

  return stats;
}

/**
 * Hook para listar convites pendentes da empresa
 */
export function useCompanyInvites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["company-invites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from("carcontrol_profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) return [];

      const { data, error } = await supabase
        .from("company_invites")
        .select("*")
        .eq("company_id", profile.company_id)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

/**
 * Hook para verificar disponibilidade de vagas
 */
export function useCheckUserSlot() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-slot-check", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from("carcontrol_profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) return null;

      const { data, error } = await supabase
        .rpc("check_user_slot_available", { p_company_id: profile.company_id });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

/**
 * Hook para criar convite
 */
export function useInviteUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      nome,
      email,
      role,
    }: {
      nome: string;
      email: string;
      role: "user" | "admin";
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("carcontrol_profiles")
        .select("company_id, role")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) throw new Error("Você não pertence a uma empresa");
      if (profile.role !== "admin" && profile.role !== "dev") {
        throw new Error("Apenas administradores podem convidar usuários");
      }

      const { data, error } = await supabase
        .from("company_invites")
        .insert({
          company_id: profile.company_id,
          nome,
          email,
          role,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este email já foi convidado");
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invites"] });
      queryClient.invalidateQueries({ queryKey: ["user-slot-check"] });
    },
  });
}

/**
 * Hook para cancelar convite
 */
export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from("company_invites")
        .delete()
        .eq("id", inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invites"] });
      queryClient.invalidateQueries({ queryKey: ["user-slot-check"] });
    },
  });
}
