import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toServiceError } from "@/integrations/supabase/services/errors";

export type Vehicle = Tables<"carcontrol_vehicles">;
export type VehicleInsert = TablesInsert<"carcontrol_vehicles">;
export type VehicleUpdate = TablesUpdate<"carcontrol_vehicles">;

/** Vehicle domain access — RLS scopes rows to the caller's tenant. */
export const vehicleService = {
  async list() {
    const { data, error } = await supabase
      .from("carcontrol_vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw toServiceError(error, "Não foi possível carregar veículos.");
    return (data ?? []) as Vehicle[];
  },

  async listOptions() {
    const { data, error } = await supabase
      .from("carcontrol_vehicles")
      .select("id, modelo, placa")
      .order("modelo", { ascending: true });

    if (error) throw toServiceError(error, "Não foi possível carregar veículos.");
    return data ?? [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("carcontrol_vehicles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw toServiceError(error, "Não foi possível carregar o veículo.");
    return data as Vehicle | null;
  },

  async create(input: VehicleInsert) {
    const { data, error } = await supabase
      .from("carcontrol_vehicles")
      .insert(input)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível criar o veículo.");
    return data as Vehicle;
  },

  async update(id: string, input: VehicleUpdate) {
    const { data, error } = await supabase
      .from("carcontrol_vehicles")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível atualizar o veículo.");
    return data as Vehicle;
  },

  async remove(id: string) {
    const { error } = await supabase.from("carcontrol_vehicles").delete().eq("id", id);
    if (error) throw toServiceError(error, "Não foi possível excluir o veículo.");
  },
};
