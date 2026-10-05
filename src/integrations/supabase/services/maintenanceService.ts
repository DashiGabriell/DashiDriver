import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toServiceError } from "@/integrations/supabase/services/errors";

export type Maintenance = Tables<"carcontrol_maintenances"> & {
  km_atual?: number | null;
  observacoes?: string | null;
  photo_url?: string | null;
};
export type MaintenanceInsert = TablesInsert<"carcontrol_maintenances"> & {
  km_atual?: number | null;
  observacoes?: string | null;
  photo_url?: string | null;
};
export type MaintenanceUpdate = TablesUpdate<"carcontrol_maintenances"> & {
  km_atual?: number | null;
  observacoes?: string | null;
  photo_url?: string | null;
};
/** Maintenance domain access — RLS scopes rows to the caller's tenant. */
export const maintenanceService = {
  async list() {
    const { data, error } = await supabase
      .from("carcontrol_maintenances")
      .select("*")
      .order("data", { ascending: false });

    if (error) throw toServiceError(error, "Não foi possível carregar manutenções.");
    return (data ?? []) as Maintenance[];
  },

  async listByUser(userId: string) {
    const { data, error } = await supabase
      .from("carcontrol_maintenances")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false });

    if (error) throw toServiceError(error, "Não foi possível carregar manutenções.");
    return (data ?? []) as Maintenance[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("carcontrol_maintenances")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw toServiceError(error, "Não foi possível carregar a manutenção.");
    return data as Maintenance | null;
  },

  async create(input: MaintenanceInsert) {
    const { data, error } = await supabase
      .from("carcontrol_maintenances")
      .insert(input as never)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível criar a manutenção.");
    return data as Maintenance;
  },

  async update(id: string, input: MaintenanceUpdate) {
    const { data, error } = await supabase
      .from("carcontrol_maintenances")
      .update(input as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível atualizar a manutenção.");
    return data as Maintenance;
  },
  async remove(id: string) {
    const { error } = await supabase.from("carcontrol_maintenances").delete().eq("id", id);
    if (error) throw toServiceError(error, "Não foi possível excluir a manutenção.");
  },
};
