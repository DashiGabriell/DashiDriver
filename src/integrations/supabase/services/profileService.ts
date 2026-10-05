import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { toServiceError } from "@/integrations/supabase/services/errors";

export type Profile = Tables<"carcontrol_profiles">;
export type Company = Tables<"carcontrol_companies">;

export const profileService = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from("carcontrol_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw toServiceError(error, "Não foi possível carregar o perfil.");
    return data as Profile | null;
  },

  async update(id: string, input: TablesUpdate<"carcontrol_profiles">) {
    const { data, error } = await supabase
      .from("carcontrol_profiles")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível atualizar o perfil.");
    return data as Profile;
  },

  async getCompany(companyId: string) {
    const { data, error } = await supabase
      .from("carcontrol_companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();

    if (error) throw toServiceError(error, "Não foi possível carregar a empresa.");
    return data as Company | null;
  },

  async updateCompany(
    companyId: string,
    input: TablesUpdate<"carcontrol_companies"> & { logo_url?: string | null },
  ) {
    const { data, error } = await supabase
      .from("carcontrol_companies")
      .update(input as never)
      .eq("id", companyId)
      .select()
      .single();

    if (error) throw toServiceError(error, "Não foi possível atualizar a empresa.");
    return data as Company;
  },
};
