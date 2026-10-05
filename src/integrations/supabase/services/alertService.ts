import { supabase } from "@/integrations/supabase/client";
import { toServiceError } from "@/integrations/supabase/services/errors";
import type { Tables } from "@/integrations/supabase/types";

export type AlertSeverity = "critico" | "atencao" | "info";
export type AlertType =
  | "pagamento"
  | "seguro"
  | "manutencao"
  | "documento"
  | "contrato"
  | "ocioso"
  | "avaria";
export type Alert = Tables<"carcontrol_alerts">;

export const alertService = {
  async list() {
    const { data, error } = await supabase
      .from("carcontrol_alerts")
      .select("*")
      .order("data", { ascending: false });

    if (error) throw toServiceError(error, "Não foi possível carregar alertas.");
    return (data ?? []) as Alert[];
  },

  async create(input: {
    company_id: string;
    vehicle_id: string;
    driver_id?: string;
    tipo: AlertType;
    severidade: AlertSeverity;
    titulo: string;
    descricao: string;
    data?: string;
  }) {
    // Types lag schema (company_id / vehicle_id present in DB + older migrations).
    const { data, error } = await supabase
      .from("carcontrol_alerts")
      .insert({
        ...input,
        data: input.data || new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível criar o alerta.");
    return data;
  },
};
