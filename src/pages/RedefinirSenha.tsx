import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { authService } from "@/integrations/supabase/services/authService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/lib/validators/login";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique a senha informada");
      return;
    }

    setSaving(true);
    try {
      await authService.updatePassword(password);
      toast.success("Senha redefinida com sucesso!");
      navigate("/bem-vindo", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao redefinir a senha"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <img src="/assets/loading-carcontrol-coelho.gif" alt="Carregando" className="w-32 h-32 object-contain" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="neu w-full max-w-md p-7 md:p-8 space-y-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-bold tracking-tight">Redefinir senha</h1>
          <p className="text-xs text-muted-foreground">
            {session
              ? "Escolha uma nova senha para a sua conta DashiDrive."
              : "Este link é inválido ou expirou. Peça um novo na tela de login, usando o mesmo navegador em que vai abrir o e-mail."}
          </p>
        </div>

        {session ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
              <Input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Use pelo menos 8 caracteres, combinando letras e números.</span>
            </div>
            <Button type="submit" className="w-full h-11" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        ) : (
          <Button className="w-full h-11" onClick={() => navigate("/login", { replace: true })}>
            Voltar ao login
          </Button>
        )}
      </div>
    </div>
  );
};

export default RedefinirSenha;
