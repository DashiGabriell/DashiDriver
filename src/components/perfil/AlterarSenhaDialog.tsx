import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export function AlterarSenhaDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroReauth, setErroReauth] = useState(false);
  const [reauthEnviado, setReauthEnviado] = useState(false);

  const handleSubmit = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      toast({ title: "Senha fraca", description: "A senha deve ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({ title: "Senhas não conferem", description: "A nova senha e a confirmação devem ser iguais.", variant: "destructive" });
      return;
    }

    setEnviando(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        if (error.message?.toLowerCase().includes("reauth") || error.message?.toLowerCase().includes("reauthentication")) {
          setErroReauth(true);
          return;
        }
        toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Senha alterada com sucesso!", description: "Sua senha foi atualizada." });
      setOpen(false);
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message || "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const handleReautenticar = async () => {
    setEnviando(true);
    try {
      const { error } = await supabase.auth.reauthenticate();
      if (error) {
        toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" });
        return;
      }
      setReauthEnviado(true);
      toast({
        title: "E-mail de verificação enviado",
        description: "Verifique sua caixa de entrada e clique no link para autorizar a alteração.",
      });
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message || "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const aoFechar = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setNovaSenha("");
      setConfirmarSenha("");
      setErroReauth(false);
      setReauthEnviado(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={aoFechar}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          Alterar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>
            Escolha uma senha forte e exclusiva para sua conta.
          </DialogDescription>
        </DialogHeader>

        {reauthEnviado ? (
          <div className="space-y-4 py-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <p className="font-semibold text-lg">Verificação enviada!</p>
            <p className="text-sm text-muted-foreground">
              Enviamos um e-mail de verificação para sua conta. Clique no link recebido e
              após confirmado, tente alterar a senha novamente.
            </p>
            <DialogFooter className="justify-center sm:justify-center pt-2">
              <Button variant="outline" onClick={() => aoFechar(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : erroReauth ? (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Verificação necessária</p>
                <p>
                  Por segurança, precisamos verificar sua identidade antes de alterar a senha.
                  Clique no botão abaixo para receber um e-mail de verificação.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => aoFechar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReautenticar} disabled={enviando}>
                {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                {enviando ? "Enviando..." : "Enviar verificação"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input
                id="nova-senha"
                type="password"
                placeholder="Mínimo de 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
              <Input
                id="confirmar-senha"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Use uma senha com pelo menos 6 caracteres, combinando letras e números para maior segurança.
              </span>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => aoFechar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={enviando || !novaSenha || novaSenha.length < 6 || novaSenha !== confirmarSenha}>
                {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {enviando ? "Alterando..." : "Alterar senha"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
