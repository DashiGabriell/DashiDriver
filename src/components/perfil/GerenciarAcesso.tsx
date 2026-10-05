import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/integrations/supabase/auth";
import { Loader2, LogIn, LogOut, Mail } from "lucide-react";
import type { UserIdentity } from "@supabase/supabase-js";

export function GerenciarAcesso() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [vinculando, setVinculando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarIdentidades = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      setIdentities(data.user?.identities || []);
    } catch (err: any) {

    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarIdentidades();
  }, [carregarIdentidades]);

  const provedorGoogle = identities.find((i) => i.provider === "google");
  const provedorEmail = identities.find((i) => i.provider === "email");

  const handleVincularGoogle = async () => {
    setVinculando(true);
    try {
      const { error } = await supabase.auth.linkIdentity({ provider: "google" });
      if (error) {
        toast({ title: "Erro ao vincular", description: error.message, variant: "destructive" });
        return;
      }
      await carregarIdentidades();
      toast({ title: "Google vinculado!", description: "Agora você pode acessar com sua conta Google." });
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message || "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setVinculando(false);
    }
  };

  const handleDesvincularGoogle = async () => {
    if (!provedorGoogle?.id) return;

    const confirmou = window.confirm(
      "Tem certeza que deseja desvincular o Google? Você ainda poderá acessar usando e-mail e senha."
    );
    if (!confirmou) return;

    try {
      const { error } = await supabase.auth.unlinkIdentity(provedorGoogle);
      if (error) {
        toast({ title: "Erro ao desvincular", description: error.message, variant: "destructive" });
        return;
      }
      await carregarIdentidades();
      toast({ title: "Google desvinculado", description: "O acesso via Google foi removido da sua conta." });
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message || "Tente novamente mais tarde.", variant: "destructive" });
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {provedorEmail && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">E-mail e senha</p>
              <p className="text-xs text-muted-foreground">{provedorEmail.identity_data?.email || user?.email}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
            Conectado
          </span>
        </div>
      )}

      {provedorGoogle ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.93c1.72 0 3.27.6 4.5 1.58l3.36-3.36A11.94 11.94 0 0 0 12 0a12 12 0 0 0-10.73 6.63l4 3.13Z"/><path fill="#4285F4" d="M16.5 18.29A7.13 7.13 0 0 1 12 20a7.08 7.08 0 0 1-6.73-4.76l-4 3.13A12 12 0 0 0 12 24a11.7 11.7 0 0 0 8.09-3.12l-3.6-2.59Z"/><path fill="#FBBC05" d="M5.27 14.24A7.08 7.08 0 0 1 4.93 12c0-.78.12-1.52.34-2.24l-4-3.13A11.9 11.9 0 0 0 0 12c0 2.7.9 5.2 2.42 7.24l2.85-5Z"/><path fill="#34A853" d="M12 24c3.04 0 5.8-1.1 7.92-2.93l-3.42-2.46A7.06 7.06 0 0 1 12 20a7.08 7.08 0 0 1-6.73-4.76l-4 3.13A11.94 11.94 0 0 0 12 24Z"/></svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Google</p>
              <p className="text-xs text-muted-foreground">{provedorGoogle.identity_data?.email || user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDesvincularGoogle} className="text-danger border-danger/30 hover:bg-danger/10">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Desvincular
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 px-4" onClick={handleVincularGoogle} disabled={vinculando}>
          {vinculando ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.93c1.72 0 3.27.6 4.5 1.58l3.36-3.36A11.94 11.94 0 0 0 12 0a12 12 0 0 0-10.73 6.63l4 3.13Z"/><path fill="#4285F4" d="M16.5 18.29A7.13 7.13 0 0 1 12 20a7.08 7.08 0 0 1-6.73-4.76l-4 3.13A12 12 0 0 0 12 24a11.7 11.7 0 0 0 8.09-3.12l-3.6-2.59Z"/><path fill="#FBBC05" d="M5.27 14.24A7.08 7.08 0 0 1 4.93 12c0-.78.12-1.52.34-2.24l-4-3.13A11.9 11.9 0 0 0 0 12c0 2.7.9 5.2 2.42 7.24l2.85-5Z"/><path fill="#34A853" d="M12 24c3.04 0 5.8-1.1 7.92-2.93l-3.42-2.46A7.06 7.06 0 0 1 12 20a7.08 7.08 0 0 1-6.73-4.76l-4 3.13A11.94 11.94 0 0 0 12 24Z"/></svg>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold">Vincular Google</p>
            <p className="text-xs text-muted-foreground">Acesse sua conta com o Google</p>
          </div>
        </Button>
      )}
    </div>
  );
}
