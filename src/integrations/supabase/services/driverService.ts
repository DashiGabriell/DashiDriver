import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toServiceError } from "@/integrations/supabase/services/errors";

export type Driver = Tables<"carcontrol_drivers">;
export type DriverInsert = TablesInsert<"carcontrol_drivers">;
export type DriverUpdate = TablesUpdate<"carcontrol_drivers">;
export type DriverWithVehicle = Driver & {
  carcontrol_vehicles?: Tables<"carcontrol_vehicles"> | null;
};

/** Driver domain access — RLS scopes rows to the caller's tenant. */
export const driverService = {
  async listWithVehicle() {
    const { data, error } = await supabase
      .from("carcontrol_drivers")
      .select("*, carcontrol_vehicles!veiculo_id(*)")
      .order("created_at", { ascending: false });

    if (error) throw toServiceError(error, "Não foi possível carregar motoristas.");
    return (data ?? []) as DriverWithVehicle[];
  },

  /** Drivers with vehicle + active schedule weekly value (desktop Motoristas). */
  async listWithWeeklyValue() {
    const drivers = await this.listWithVehicle();

    return Promise.all(
      drivers.map(async (driver) => {
        const { data: scheduleData } = await supabase
          .from("carcontrol_payment_schedules")
          .select("valor")
          .eq("driver_id", driver.id)
          .eq("ativo", true)
          .maybeSingle();

        return {
          ...driver,
          valor_semanal: scheduleData?.valor ?? 0,
        };
      }),
    );
  },

  async getActiveWeeklyValue(driverId: string): Promise<number> {
    const { data, error } = await supabase
      .from("carcontrol_payment_schedules")
      .select("valor")
      .eq("driver_id", driverId)
      .eq("ativo", true)
      .maybeSingle();

    if (error) return 0;
    return data?.valor ?? 0;
  },

  async listOptions() {
    const { data, error } = await supabase
      .from("carcontrol_drivers")
      .select("id, nome, veiculo_id")
      .order("nome", { ascending: true });

    if (error) throw toServiceError(error, "Não foi possível carregar motoristas.");
    return data ?? [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("carcontrol_drivers")
      .select("*, carcontrol_vehicles!veiculo_id(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw toServiceError(error, "Não foi possível carregar o motorista.");
    return data as DriverWithVehicle | null;
  },

  async create(input: DriverInsert) {
    const { data, error } = await supabase
      .from("carcontrol_drivers")
      .insert(input)
      .select("*, carcontrol_vehicles!veiculo_id(*)")
      .single();

    if (error) throw toServiceError(error, "Não foi possível criar o motorista.");
    return data as DriverWithVehicle;
  },

  async update(id: string, input: DriverUpdate) {
    const { data, error } = await supabase
      .from("carcontrol_drivers")
      .update(input)
      .eq("id", id)
      .select("*, carcontrol_vehicles!veiculo_id(*)")
      .single();

    if (error) throw toServiceError(error, "Não foi possível atualizar o motorista.");
    return data as DriverWithVehicle;
  },

  async remove(id: string) {
    const { error } = await supabase.from("carcontrol_drivers").delete().eq("id", id);
    if (error) throw toServiceError(error, "Não foi possível excluir o motorista.");
  },
};
