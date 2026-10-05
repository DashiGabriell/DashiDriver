import { supabase } from "@/integrations/supabase/client";
import { toServiceError } from "@/integrations/supabase/services/errors";

export const authService = {
  async sendPasswordReset(email: string, redirectTo: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw toServiceError(error, "Não foi possível enviar o e-mail de recuperação.");
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw toServiceError(error, "Não foi possível redefinir a senha.");
  },
};
