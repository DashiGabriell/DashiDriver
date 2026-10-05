import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, ArrowRight, LogIn, Eye, EyeOff, Car } from "lucide-react";
import { toast } from "sonner";

interface InviteData {
  id: string;
  company_id: string;
  nome: string;
  email: string;
  role: "user" | "admin";
  accepted_at: string | null;
}

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, session } = useAuth();
  const [processed, setProcessed] = useState(false);
  const [processingAuth, setProcessingAuth] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const token = searchParams.get("token");

  const { data: invite, isLoading: inviteLoading } = useQuery({
    queryKey: ["invite", token],
    queryFn: async (): Promise<InviteData | null> => {
      if (!token) return null;
      const { data, error } = await supabase
        .from("company_invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!user || !invite || invite.accepted_at) return;

      if (user.email !== invite.email) {
        throw new Error("Este convite foi enviado para outro email");
      }

      const { error: updateError } = await supabase
        .from("carcontrol_profiles")
        .update({ company_id: invite.company_id, role: invite.role })
        .eq("id", user.id);

      if (updateError) throw updateError;

      const { error: acceptError } = await supabase
        .from("company_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      if (acceptError) throw acceptError;
    },
    onSuccess: () => {
      toast.success("Convite aceito! Bem-vindo à empresa.");
      setProcessed(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Preencha email e senha");
      return;
    }
    setProcessingAuth(true);
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email: loginEmail.trim(),
          password: loginPassword,
          options: { data: { full_name: loginEmail.split("@")[0] } },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para ativar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao autenticar");
    } finally {
      setProcessingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setProcessingAuth(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/aceitar-convite?token=${token}` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com Google");
      setProcessingAuth(false);
    }
  };

  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || (!invite && !inviteLoading)) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>Nenhum convite encontrado com este link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Convite não encontrado</CardTitle>
            <CardDescription>Este convite pode ter expirado ou ser inválido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <CardTitle>Convite já aceito</CardTitle>
            <CardDescription>Este convite já foi utilizado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")}>Ir para o login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processed) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <CardTitle>Convite aceito!</CardTitle>
            <CardDescription>Redirecionando para o dashboard...</CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4 py-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Car className="w-12 h-12 text-primary" />
            </div>
            <CardTitle>Você foi convidado!</CardTitle>
            <CardDescription>
              <strong>{invite.nome}</strong> te convidou para entrar na empresa como{" "}
              <strong>{invite.role === "admin" ? "Administrador" : "Usuário"}</strong>.
              <br />
              Faça login ou crie uma conta para aceitar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={processingAuth}>
                {processingAuth ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isRegistering ? "Criar conta e aceitar" : "Entrar e aceitar convite"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={processingAuth}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {processingAuth ? "Aguarde..." : "Continuar com Google"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {isRegistering ? "Já tem conta?" : "Não tem conta?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-primary hover:underline font-medium"
                >
                  {isRegistering ? "Fazer login" : "Criar conta"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.email !== invite.email) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <CardTitle>Email diferente</CardTitle>
            <CardDescription>
              Este convite foi enviado para <strong>{invite.email}</strong>, mas você está logado como{" "}
              <strong>{user.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => supabase.auth.signOut()}>
              Sair e trocar de conta
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CheckCircle2 className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle>Aceitar convite</CardTitle>
          <CardDescription>
            <strong>{invite.nome}</strong> te convidou para entrar na empresa como{" "}
            <strong>{invite.role === "admin" ? "Administrador" : "Usuário"}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full gap-2"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {acceptMutation.isPending ? "Aceitando..." : "Aceitar convite"}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Recusar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
