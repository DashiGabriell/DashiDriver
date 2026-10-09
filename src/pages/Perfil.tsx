import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { useChecklistsCount } from "@/hooks/useChecklistsCount";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { profileService } from "@/integrations/supabase/services/profileService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, 
  Mail, 
  Loader2, 
  Save,
  Trash2,
  AlertTriangle,
  Building,
  MapPin,
  Phone,
  Hash,
  Upload,
  Shield,
  Key,
  LogIn,
} from "lucide-react";
import { fmtDate } from "@/lib/utils";
import { useTheme } from "next-themes";
import { TrialCounter } from "@/components/TrialCounter";
import { motion } from "framer-motion";
import { AlterarEmailDialog } from "@/components/perfil/AlterarEmailDialog";
import { AlterarSenhaDialog } from "@/components/perfil/AlterarSenhaDialog";
import { GerenciarAcesso } from "@/components/perfil/GerenciarAcesso";

const Perfil = () => {
  const { theme, setTheme } = useTheme();
  const { session } = useAuth();
  const { profile, company, userRole, planName, planLimits, loading, updateProfile, updatePreferencias } = useCarcontrolUser();
  const { data: checklistsCount = 0, isLoading: isLoadingChecklists } = useChecklistsCount();
  const { toast } = useToast();
  const navigate = useNavigate();

  const planOrder: Record<string, string | null> = {
    BASICO: 'gestao-pro',
    PRO: 'gestao-master',
    MASTER: null,
  };
  const currentPlan = company?.saas_plan || 'BASICO';
  const nextPlanSlug = planOrder[currentPlan];
  const isMaxPlan = nextPlanSlug === null;
  
  const [nome, setNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Company editable fields
  const [companyNome, setCompanyNome] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyTelefone, setCompanyTelefone] = useState("");
  const [companyEndereco, setCompanyEndereco] = useState("");
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const companyLogoInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state with profile data
  useEffect(() => {
    if (profile) {
      setNome(profile.nome || "");
      setAvatarUrl(profile.avatar_url || "");
      setAvatarPreview(profile.avatar_url || "");
      setAvatarFile(null);
    }
  }, [profile]);

  // Sync state with company data
  useEffect(() => {
    if (company) {
      setCompanyNome(company.nome || "");
      setCompanyEmail(company.email || "");
      setCompanyTelefone(company.telefone || "");
      setCompanyEndereco(company.endereco || "");
      setCompanyLogoPreview((company as any).logo_url || "");
      setCompanyLogoFile(null);
    }
  }, [company]);

  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(avatarUrl);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor selecione uma imagem (PNG, JPG, WEBP, GIF).",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCompanyLogoChange = (file: File | null) => {
    if (!file) {
      setCompanyLogoFile(null);
      setCompanyLogoPreview((company as any)?.logo_url || "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor selecione uma imagem (PNG, JPG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (avatarFile && avatarPreview.startsWith("blob:")) {
      return () => URL.revokeObjectURL(avatarPreview);
    }
    return undefined;
  }, [avatarFile, avatarPreview]);

  useEffect(() => {
    if (companyLogoFile && companyLogoPreview.startsWith("blob:")) {
      return () => URL.revokeObjectURL(companyLogoPreview);
    }
    return undefined;
  }, [companyLogoFile, companyLogoPreview]);

  const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Falha ao ler arquivo de imagem"));
        }
      };
      reader.onerror = () => reject(new Error("Falha ao ler arquivo de imagem"));
      reader.readAsDataURL(file);
    });
  };

  const handleSaveBasic = async () => {
    setSaving(true);

    let avatar_url = avatarUrl;
    if (avatarFile) {
      try {
        avatar_url = await readFileAsDataUrl(avatarFile);
      } catch (err: any) {
        setSaving(false);
        toast({
          title: "Erro ao processar imagem",
          description: err?.message || "Não foi possível ler a imagem selecionada.",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await updateProfile({ nome, avatar_url });
    setSaving(false);
    
    if (error) {

      toast({
        title: "Erro ao salvar",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Informações atualizadas com sucesso.",
      });
    }
  };

  const handleSaveCompany = async () => {
    if (!company?.id) return;
    setSavingCompany(true);

    try {
      let logo_url = (company as any).logo_url || "";

      if (companyLogoFile) {
        const ext = companyLogoFile.name.split(".").pop() || "png";
        const path = `${company.id}/logo_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(path, companyLogoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("company-logos")
          .getPublicUrl(path);

        logo_url = publicUrl;
      }

      await profileService.updateCompany(company.id, {
        nome: companyNome,
        email: companyEmail,
        telefone: companyTelefone,
        endereco: companyEndereco,
        logo_url,
        updated_at: new Date().toISOString(),
      });

      toast({ title: "Sucesso!", description: "Empresa atualizada com sucesso." });
      setCompanyLogoFile(null);
    } catch (err: unknown) {
      toast({ title: "Erro ao salvar", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSavingCompany(false);
    }
  };

  const handleUpdatePref = async (key: string, value: any) => {
    if (key === 'tema') {
      setTheme(value === 'auto' ? 'system' : value);
    }
    const { error } = await updatePreferencias({ [key]: value });
    if (error) {

      toast({
        title: "Erro ao atualizar preferência",
        description: error,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const preferencias = (profile?.preferencias as any) || {};

  const profileAny = profile as any;
  let planProgress: { progress: number; remaining: number } | null = null;

  if (profileAny?.trial === 'ativo' && profileAny?.created_at) {
    const start = new Date(profileAny.created_at);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const totalDays = 7;
    const consumed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    planProgress = {
      progress: Math.min(100, (consumed / totalDays) * 100),
      remaining: Math.max(0, totalDays - consumed),
    };
  } else if (profileAny?.data_expiracao) {
    const end = new Date(profileAny.data_expiracao);
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    const now = new Date();
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const consumed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    planProgress = {
      progress: Math.min(100, (consumed / totalDays) * 100),
      remaining: Math.max(0, totalDays - consumed),
    };
  }

  return (
    <AppShell>
      <Topbar title="Meu Perfil" subtitle="Gerencie suas informações e preferências" helpPath="/ajuda/gestao/perfil" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* Lado Esquerdo: Resumo do Perfil */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="neu overflow-hidden border-none shadow-none">
            <CardHeader className="pb-4 text-center">
              <div className="relative mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-foreground text-background grid place-items-center font-bold text-3xl shrink-0 uppercase mx-auto neu-sm border-4 border-background">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.nome || ""} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (profile?.nome || profile?.email || "U").slice(0, 2).toUpperCase()
                  )}
                </div>
                <Badge className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground border-2 border-background">
                  {planName}
                </Badge>
                <div className="mt-2">
                  <TrialCounter />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">{profile?.nome || "Usuário"}</CardTitle>
              <CardDescription className="text-sm font-medium opacity-70">{profile?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <img src="/assets/escudo.png" alt="Função" className="w-4 h-4" />
                  <span>Função</span>
                </div>
                <span className="font-semibold capitalize">{userRole}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <img src="/assets/historico.png" alt="Membro desde" className="w-4 h-4" />
                  <span>Membro desde</span>
                </div>
                <span className="font-semibold">{profile ? fmtDate(profile.created_at) : "-"}</span>
              </div>
              <Separator className="my-2 bg-muted/50" />
              <div className="space-y-3 pt-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Uso do Plano</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5"><img src="/assets/carroPreto.png" alt="Veículos" className="w-3 h-3" /> Veículos</span>
                    <span>{profile?.total_veiculos} / {planLimits.veiculos}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, ((profile?.total_veiculos || 0) / planLimits.veiculos) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5"><img src="/assets/grupo.png" alt="Motoristas" className="w-3 h-3" /> Motoristas</span>
                    <span>{profile?.total_motoristas} / {planLimits.motoristas}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, ((profile?.total_motoristas || 0) / planLimits.motoristas) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      {isLoadingChecklists ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <img src="/assets/checklist.png" alt="Checklists" className="w-3 h-3" />
                      )}
                      {" "}Checklists
                    </span>
                    <span className="font-semibold">{checklistsCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="neu-sm border-none shadow-none p-4">
            <div className="flex items-center gap-3 text-warning">
              <img src="/assets/creditcard.png" alt="Assinatura" className="w-5 h-5" />
              <div className="text-sm font-semibold">Assinatura Ativa</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Você está no plano <strong>{planName}</strong>
              {profileAny?.trial === 'ativo' && <span> (Trial)</span>}.
            </p>
            <div className="mt-2">
              {isMaxPlan ? (
                <Button disabled variant="outline" size="sm">
                  Plano Máximo
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                  onClick={() => navigate(`/checkout/${nextPlanSlug}`)}
                >
                  Fazer Upgrade
                </Button>
              )}
            </div>
            {planProgress && (
              <div className="mt-3 space-y-1.5">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-warning rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${planProgress.progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {planProgress.remaining > 0
                    ? `${planProgress.remaining} dia${planProgress.remaining > 1 ? 's' : ''} restantes`
                    : 'Plano vencido'}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Lado Direito: Formulários de Edição */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informações Básicas */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <User className="w-5 h-5" />
              <h3>Informações Pessoais</h3>
            </div>
            <Card className="neu border-none shadow-none">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="nome" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="pl-10"
                        placeholder="Como quer ser chamado?"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail (Principal)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        value={profile?.email || ""} 
                        disabled 
                        className="pl-10 opacity-60"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="avatar">Foto de Perfil</Label>
                    <div className="grid gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="neu-button"
                        >
                          Selecionar imagem
                        </Button>
                        {avatarFile ? (
                          <span className="text-sm text-muted-foreground">{avatarFile.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Nenhuma imagem nova selecionada</span>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          handleAvatarChange(file);
                        }}
                      />
                      {avatarPreview ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden border border-muted/40">
                          <img
                            src={avatarPreview}
                            alt="Preview do avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-muted/30 grid place-items-center text-sm text-muted-foreground">
                          Sem avatar
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        Selecione uma imagem de perfil a partir do seu dispositivo. O campo de URL não é necessário.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveBasic} 
                    disabled={saving}
                    className="neu-button"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Informações da Empresa */}
          {company && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Building className="w-5 h-5" />
                <h3>Informações da Empresa</h3>
              </div>
              <Card className="neu border-none shadow-none">
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden">
                        {companyLogoPreview ? (
                          <img src={companyLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-8 h-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => companyLogoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      ref={companyLogoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCompanyLogoChange(e.target.files?.[0] || null)}
                    />
                    <p className="text-[10px] text-muted-foreground -mt-2">Logo da empresa</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nome da Locadora / Empresa</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company-name"
                          value={companyNome}
                          onChange={(e) => setCompanyNome(e.target.value)}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-cnpj">CNPJ</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company-cnpj"
                          value={company.cnpj || "Não informado"}
                          readOnly
                          className="pl-10 bg-muted/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">E-mail Corporativo</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company-email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Telefone de Contato</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company-phone"
                          value={companyTelefone}
                          onChange={(e) => setCompanyTelefone(e.target.value)}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="company-address">Endereço Completo</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company-address"
                          value={companyEndereco}
                          onChange={(e) => setCompanyEndereco(e.target.value)}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveCompany}
                    disabled={savingCompany}
                    className="gap-2"
                  >
                    {savingCompany ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingCompany ? "Salvando..." : "Salvar Informações"}
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Preferências do Sistema */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <img src="/assets/settings.png" alt="Preferências" className="w-5 h-5" />
              <h3>Preferências e Sistema</h3>
            </div>
            <Card className="neu border-none shadow-none">
              <CardContent className="p-6 space-y-8">
                
                {/* Aparência */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <img src="/assets/paleta.png" alt="Aparência" className="w-3.5 h-3.5" />
                    Aparência do Sistema
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'light', label: 'Claro', icon: '/assets/claro.png' },
                      { id: 'dark', label: 'Escuro', icon: '/assets/escuro.png' },
                      { id: 'auto', label: 'Automático', icon: '/assets/notebook.png' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleUpdatePref('tema', t.id)}
                        className={`flex-1 min-w-[100px] p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          (preferencias.tema || 'auto') === t.id 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-transparent bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        <img src={t.icon} alt={t.label} className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-muted/50" />

                {/* Localização */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <img src="/assets/globo.png" alt="Idioma" className="w-3.5 h-3.5" />
                      Idioma Padrão
                    </div>
                    <select 
                      className="w-full h-10 px-3 rounded-lg bg-muted/20 border-none text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                      value={preferencias.idioma || 'pt-BR'}
                      onChange={(e) => handleUpdatePref('idioma', e.target.value)}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (USA)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <img src="/assets/creditcard.png" alt="Moeda" className="w-3.5 h-3.5" />
                      Moeda Preferencial
                    </div>
                    <select 
                      className="w-full h-10 px-3 rounded-lg bg-muted/20 border-none text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                      value={preferencias.moeda || 'BRL'}
                      onChange={(e) => handleUpdatePref('moeda', e.target.value)}
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="USD">Dólar (US$)</option>
                      <option value="EUR">Euro (â‚¬)</option>
                    </select>
                  </div>
                </div>

              </CardContent>
            </Card>
          </section>

          {/* Segurança da Conta */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Shield className="w-5 h-5" />
              <h3>Segurança da Conta</h3>
            </div>
            <Card className="neu border-none shadow-none">
              <CardContent className="p-6 space-y-6">
                {/* Alterar E-mail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">E-mail de Acesso</p>
                      <p className="text-xs text-muted-foreground">{profile?.email || "—"}</p>
                    </div>
                  </div>
                  <AlterarEmailDialog emailAtual={profile?.email || ""} />
                </div>

                {/* Alterar Senha */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Key className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Senha</p>
                      <p className="text-xs text-muted-foreground">••••••••••</p>
                    </div>
                  </div>
                  <AlterarSenhaDialog />
                </div>

                <Separator className="bg-muted/50" />

                {/* Modo de Acesso */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <LogIn className="w-3.5 h-3.5" />
                    Modo de Acesso
                  </div>
                  <GerenciarAcesso />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Zona de Perigo */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-danger font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h3>Zona de Perigo</h3>
            </div>
            <Card className="neu-sm border-2 border-danger/20 bg-danger/5 shadow-none">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-danger">Limpar Informações de Perfil</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                    Isso irá remover seu nome personalizado, avatar e resetar todas as preferências para os padrões de fábrica. Seus dados de veículos e motoristas não serão afetados.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  className="shrink-0"
                  onClick={async () => {
                    if (window.confirm("Tem certeza que deseja limpar seus dados de perfil? Isso não afetará seus veículos ou motoristas.")) {
                      const { error } = await updateProfile({ 
                        nome: null, 
                        avatar_url: null,
                        preferencias: {
                          tema: "auto",
                          notificacoes_email: true,
                          notificacoes_push: false,
                          idioma: "pt-BR",
                          moeda: "BRL"
                        }
                      });
                      if (!error) {
                        toast({ title: "Perfil Resetado", description: "Suas informações foram limpas com sucesso." });
                      }
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Perfil
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default Perfil;
