import { useState, useEffect } from "react";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { useAuth } from "@/integrations/supabase/auth";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  Car,
  Users,
  Loader2,
  Save,
  Palette,
  ChevronRight,
  LogOut,
} from "lucide-react";

function MobilePerfil() {
  const { profile, loading, updateProfile, updatePreferencias, planName, planLimits } = useCarcontrolUser();
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const { toast } = useToast();

  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || "");
    }
  }, [profile]);

  const handleSaveBasic = async () => {
    setSaving(true);
    const { error } = await updateProfile({ nome });
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
        description: "Perfil atualizado com sucesso.",
      });
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
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando seu perfil...</p>
      </div>
    );
  }

  const preferencias = (profile?.preferencias as any) || {};
  const initials = (profile?.nome || profile?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in pb-24">
      {/* Header com Avatar */}
      <div className="relative pt-6 pb-12 px-4 bg-gradient-to-b from-primary/10 to-transparent rounded-b-[3rem]">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground border-2 border-background">
              {planName}
            </Badge>
          </div>
          <h2 className="text-xl font-bold">{profile?.nome || "Usuário"}</h2>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-6">
        {/* Card de Estatísticas de Uso */}
        <Card className="neu border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Status do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> Veículos</span>
                <span>{profile?.total_veiculos} / {planLimits.veiculos}</span>
              </div>
              <Progress 
                value={Math.min(100, ((profile?.total_veiculos || 0) / planLimits.veiculos) * 100)} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Motoristas</span>
                <span>{profile?.total_motoristas} / {planLimits.motoristas}</span>
              </div>
              <Progress 
                value={Math.min(100, ((profile?.total_motoristas || 0) / planLimits.motoristas) * 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Pessoais */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">Informações Pessoais</h3>
          <Card className="neu border-none shadow-md overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-xs font-bold text-muted-foreground uppercase ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    className="pl-10 h-12 rounded-xl bg-muted/30 border-none"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveBasic} 
                disabled={saving}
                className="w-full h-12 rounded-xl font-bold shadow-lg"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configurações de Aparência */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">Preferências</h3>
          <Card className="neu border-none shadow-md overflow-hidden">
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Palette className="w-3.5 h-3.5" />
                  Tema do Sistema
                </div>
                <div className="flex gap-2">
                  {[ 
                    { id: 'light', label: 'Claro', src: '/assets/claro.png' },
                    { id: 'dark', label: 'Escuro', src: '/assets/escuro.png' },
                    { id: 'auto', label: 'Auto', src: '/assets/laptop.png' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleUpdatePref('tema', t.id)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                        (preferencias.tema || 'auto') === t.id 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-transparent bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <img src={t.src} alt={t.label} className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-muted/50" />

              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <img src="/assets/lingua.png" alt="Idioma" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Idioma</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Português (Brasil)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                      <img src="/assets/rs.png" alt="Moeda" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Moeda</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Real (BRL)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Rápidos e Suporte */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">Geral</h3>
          <Card className="neu border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
              {[ 
                { src: "/assets/alertasNavbar.png", label: "Notificações", color: "text-orange-500", bg: "bg-orange-500/10" },
                { src: "/assets/escudo.png", label: "Privacidade e Segurança", color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { src: "/assets/checklist.png", label: "Centro de Ajuda", color: "text-cyan-500", bg: "bg-cyan-500/10" },
                { src: "/assets/folders.png", label: "Termos de Uso", color: "text-slate-500", bg: "bg-slate-500/10" },
                { src: "/assets/notebook.png", label: "Sistema", color: "text-purple-500", bg: "bg-purple-500/10" },
              ].map((item, index) => (
                <div key={index}>
                  <button className="w-full flex items-center justify-between p-4 active:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}> 
                        <img src={item.src} alt={item.label} className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                  </button>
                  {index < 4 && <Separator className="bg-muted/30 mx-4 w-auto" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Ações da Conta */}
        <div className="pt-4 space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 border-muted hover:bg-muted font-bold text-muted-foreground transition-all active:scale-95"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair da Conta
          </Button>
          
          <div className="text-center px-8">
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              DashiDrive v1.0.0<br />
              © 2026 Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePerfil;
