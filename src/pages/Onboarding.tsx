/**
 * Página de Onboarding - Cadastro de Empresa
 * 
 * Layout full-page responsivo seguindo padrões Squad Dashi
 * Mobile-first, acessível e otimizado para performance
 * 
 * @author Squad Dashi
 * @date 2026-05-05
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCompany } from "@/hooks/useCompany";
import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Adicionado

const maskCNPJ = (value: string) => {
  return value.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const maskTelefone = (value: string) => {
  return value.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createCompany = useCreateCompany();

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: user?.email || "",
    telefone: "",
    endereco: "",
  });

  const [step, setStep] = useState<"form" | "success">("form");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'cnpj') {
      sanitizedValue = maskCNPJ(value);
    } else if (name === 'telefone') {
      sanitizedValue = maskTelefone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nomeClean = formData.nome.trim();
    if (!nomeClean) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    try {
      // Busca perfil para verificar o plano
      const { data: profile } = await supabase
        .from("carcontrol_profiles")
        .select("plan")
        .eq("id", user!.id)
        .single();

      const companyData = await createCompany.mutateAsync({
        nome: nomeClean,
        cnpj: formData.cnpj.replace(/\D/g, '') || undefined,
        email: formData.email.trim() || undefined,
        telefone: formData.telefone.replace(/\D/g, '') || undefined,
        endereco: formData.endereco.trim() || undefined,
        plan: profile?.plan || undefined,
      });

      setStep("success");
      toast.success("Empresa cadastrada com sucesso!");

      // Redirecionar baseado no plano
      setTimeout(() => {
        if (profile?.plan === 'free7dias' || profile?.plan === 'trial') {
          navigate("/dashboard");
        } else if (profile?.plan && profile.plan.includes('gestao')) {
          navigate(`/checkout/${profile.plan}`);
        } else if (profile?.plan && profile.plan.includes('marketplace')) {
          navigate(`/checkout/${profile.plan}`);
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (error: any) {

      toast.error(error.message || "Erro ao cadastrar empresa");
    }
  };

  // Tela de sucesso
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-blur-in">
          <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-foreground">Empresa Cadastrada!</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sua empresa foi cadastrada com sucesso.<br />
            Redirecionando para o dashboard...
          </p>
          <img
            src="/assets/loading-carcontrol-coelho.gif"
            alt="Carregando"
            className="w-20 h-20 object-contain mx-auto"
          />
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => setStep("form")}
              className="h-11 px-6"
            >
              Voltar ao formulário
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de onboarding - Layout full-page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/assets/loading-carcontrol-coelho.gif" alt="DashiDrive Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Dashi<span className="text-blue-600">Drive</span>
              </h1>
              <p className="text-xs text-muted-foreground">Gestão de Frotas</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
            className="h-9"
          >
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 lg:mb-12 animate-blur-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Bem-vindo ao DashiDrive
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Configure sua Empresa
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Preencha os dados da sua locadora para começar a gerenciar sua frota de forma profissional
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-background rounded-2xl shadow-lg border p-6 md:p-8 lg:p-10 animate-blur-in">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Grid de campos - 2 colunas em desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Nome da Empresa - Full width */}
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="nome" className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Nome da Empresa
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Ex: Locadora São Paulo"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="h-12 text-base bg-background"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome fantasia ou razão social da sua empresa
                  </p>
                </div>

                {/* CNPJ */}
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-base font-semibold">
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={handleChange}
                    className="h-12 text-base bg-background"
                    maxLength={18}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional - pode ser preenchido depois
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email da Empresa
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 text-base bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email principal para contato
                  </p>
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-base font-semibold">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="h-12 text-base bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Telefone comercial ou celular
                  </p>
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="endereco" className="text-base font-semibold">
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    type="text"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="h-12 text-base bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Endereço completo da empresa
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t pt-6">
                {/* Info Box */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      Ao cadastrar sua empresa, você se torna o <strong>administrador principal</strong> e poderá 
                      convidar outros usuários, gerenciar veículos, motoristas e muito mais.
                    </span>
                  </p>
                </div>

                {/* Botão Submit */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-8 text-base order-2 sm:order-1"
                    onClick={() => navigate(-1)}
                    disabled={createCompany.isPending}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 px-8 text-base font-semibold order-1 sm:order-2"
                    disabled={createCompany.isPending || !formData.nome.trim()}
                  >
                    {createCompany.isPending ? (
                      <>
                        <img src="/assets/loading-carcontrol-coelho.gif" alt="Carregando" className="w-8 h-8 mr-2 object-contain" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 mr-2" />
                        Cadastrar Empresa
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>
              Precisa de ajuda? Entre em contato com nosso suporte
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
