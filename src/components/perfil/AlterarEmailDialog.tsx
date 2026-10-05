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
import { Mail, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AlterarEmailDialogProps {
  emailAtual: string;
}

export function AlterarEmailDialog({ emailAtual }: AlterarEmailDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async () => {
    if (!novoEmail.trim()) {
      toast({ title: "Campo obrigatório", description: "Informe o novo e-mail.", variant: "destructive" });
      return;
    }

    if (novoEmail === emailAtual) {
      toast({ title: "E-mail igual", description: "O novo e-mail é igual ao atual.", variant: "destructive" });
      return;
    }

    setEnviando(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: novoEmail });

      if (error) {
        toast({ title: "Erro ao alterar e-mail", description: error.message, variant: "destructive" });
        return;
      }

      setEnviado(true);
      toast({
        title: "E-mail de confirmação enviado",
        description: "Verifique seu e-mail atual e o novo para confirmar a alteração.",
      });
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message || "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setNovoEmail(""); setEnviado(false); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          Alterar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar E-mail de Acesso</DialogTitle>
          <DialogDescription>
            Você receberá um e-mail de confirmação no endereço atual e no novo para concluir a alteração.
          </DialogDescription>
        </DialogHeader>

        {enviado ? (
          <div className="space-y-4 py-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <p className="font-semibold text-lg">Solicitação enviada!</p>
            <p className="text-sm text-muted-foreground">
              Enviamos um e-mail de confirmação para <strong>{novoEmail}</strong> e para o seu e-mail atual.
              Clique nos links recebidos para concluir a alteração.
            </p>
            <DialogFooter className="justify-center sm:justify-center pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>E-mail atual</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-sm font-medium">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{emailAtual}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="novo-email">Novo e-mail</Label>
              <Input
                id="novo-email"
                type="email"
                placeholder="seunovo@email.com"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Após confirmar, você precisará usar o novo e-mail para acessar sua conta.
              </span>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={enviando || !novoEmail.trim()}>
                {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {enviando ? "Enviando..." : "Solicitar alteração"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
