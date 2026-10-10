import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { 
  Car,
  Table,
  CheckCircle2,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSaveOnboarding } from "@/hooks/useSaveOnboarding";
import { FeaturePreviewModal } from "@/components/FeaturePreviewModal";
import { useProfile } from "@/hooks/useProfile";

interface Respostas {
  role: "driver" | "marketplace_owner" | "fleet_management";
  nome: string;
  whatsapp: string;
  locadora: string;
  vehicleType?: string;
  fleetSize?: string;
  manageOrAnnounce?: string;
  needs?: string[];
  plan?: string;
  trial_intent?: boolean;
}

const formatarWhatsapp = (valor: string): string => {
  const apenasNumeros = valor.replace(/\D/g, "");
  const limitado = apenasNumeros.slice(0, 11);
  if (limitado.length <= 2) return limitado;
  if (limitado.length <= 7) return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
  return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7, 11)}`;
};

const RoleSelectionCard = memo(({ 
  onClick, 
  label, 
  iconSrc, 
  description,
  badge,
  active,
  disabled
}: { 
  onClick: () => void; 
  label: string; 
  iconSrc: string; 
  description: string;
  badge: string;
  active?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full p-5 rounded-3xl neu transition-all active:scale-[0.97] text-left flex flex-col gap-4 bg-card border-2",
      active ? "border-primary shadow-lg" : "border-transparent",
      disabled ? "opacity-50 grayscale cursor-not-allowed" : ""
    )}
  >
    <div className="flex justify-between items-start gap-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", active ? "bg-primary/20" : "bg-muted/50")}>
        <img src={iconSrc} alt={label} className="w-8 h-8 object-contain" />
      </div>
      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{badge}</Badge>
    </div>
    <div>
      <span className="font-display font-black text-lg block">{label}</span>
      <span className="text-xs text-muted-foreground mt-1 block">{description}</span>
    </div>
  </button>
));
RoleSelectionCard.displayName = "RoleSelectionCard";

const PlanCard = memo(({
  onClick,
  title,
  price,
  icon: Icon,
  iconSrc,
  description
}: {
  onClick: () => void;
  title: string;
  price: string;
  icon?: any;
  iconSrc?: string;
  description: string;
}) => (
  <button
    onClick={onClick}
    className="w-full p-6 rounded-3xl bg-card border-2 border-transparent hover:border-primary transition-all shadow-sm hover:shadow-lg text-left flex items-center gap-4 active:scale-[0.98]"
  >
    <div className="p-4 rounded-2xl bg-primary/10 text-primary">
      {iconSrc ? (
        <img src={iconSrc} alt={title} className="w-[51px] h-[51px] object-contain" />
      ) : (
        <Icon className="w-8 h-8" />
      )}
    </div>
    <div className="flex-1">
      <h3 className="font-display font-black text-lg">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Badge className="bg-muted text-foreground font-bold">{price}</Badge>
  </button>
));
PlanCard.displayName = "PlanCard";

const OnboardingCadastro = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [step, setStep] = useState(0);
  const [alreadyUsedTrial, setAlreadyUsedTrial] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [respostas, setRespostas] = useState<Partial<Respostas>>({});

  useEffect(() => {
    setProgresso((step / 5) * 100);
    
    // Verifica se o usuário já utilizou o trial no banco de dados e preenche dados básicos
    if (profile) {
      setAlreadyUsedTrial(!!(profile as any).has_used_free_trial);
      
      // Pré-preenche o nome se ainda não estiver definido
      if (!respostas.nome && (profile as any).nome) {
        setRespostas(prev => ({ ...prev, nome: (profile as any).nome }));
      }
    }

    // Pula a etapa de tamanho de frota se não for Gestão Completa
    if (step === 2 && respostas.role !== 'fleet_management') {
      handleNextStep();
    }

    // Pula a etapa de planos se for Motorista (gratuito)
    if (step === 4 && respostas.role === 'driver') {
      handleNextStep();
    }
  }, [step, profile, respostas.role]);

  const handleNextStep = () => setStep(prev => prev + 1);

  const handleSelectTrial = () => {
    setRespostas(prev => ({ ...prev, plan: "free7dias", trial_intent: true }));
    handleNextStep();
  };

  const handleAnswer = (key: keyof Respostas, value: any) => {
    setRespostas(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'plan' && value !== 'trial') {
        next.trial_intent = false;
      }
      return next;
    });
    handleNextStep();
  };

  const saveOnboarding = useSaveOnboarding();

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!respostas.role || !respostas.nome || !respostas.whatsapp) {
      toast({ title: "Erro", description: "Preencha todos os dados.", variant: "destructive" });
      return;
    }

    try {
      await saveOnboarding.mutateAsync({
        role: respostas.role,
        nome: respostas.nome,
        whatsapp: respostas.whatsapp,
        trial_intent: respostas.trial_intent,
        plan: respostas.plan,
      });

      toast({ title: "Cadastro finalizado!", description: "Bem-vindo ao DashiDrive." });
      if (respostas.role === "driver") {
        navigate("/marketplace/home");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar dados.", variant: "destructive" });
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      <main className="w-full max-w-lg flex-1 flex flex-col pt-4">
        <div className="w-full mb-6">
          <Progress value={progresso} className="h-2 rounded-full" />
        </div>
        
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" {...slideVariants} className="space-y-8 text-center pt-10 flex-1 flex flex-col justify-center">
              <div className="relative mx-auto mb-6">
                <img src="/assets/cabeca.png" alt="DashiDrive" className="w-20 h-20 object-contain" />
              </div>
              <h1 className="text-4xl font-display font-black tracking-tighter">A plataforma e MarketPlace inteligente para locação e gestão de veículos para aplicativo.</h1>
              <Button onClick={handleNextStep} size="lg" className="w-full h-16 rounded-2xl text-lg font-bold">Começar agora</Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" {...slideVariants} className="space-y-6 pt-4">
              <button onClick={() => setStep(prev => prev - 1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <h2 className="text-2xl font-black">Como você deseja usar?</h2>
              
              {/* Motorista e Locador Marketplace ocultos nesta fase; reativar quando os perfis forem lançados.
              <RoleSelectionCard 
                onClick={() => handleAnswer("role", "driver")} 
                label="Motorista" 
                description="Busque veículos para Uber, 99 e entregas." 
                badge="Motorista" 
                iconSrc="/assets/perfil2.png" 
              />

              <RoleSelectionCard 
                onClick={() => handleAnswer("role", "marketplace_owner")} 
                label="Locador Marketplace" 
                description="Publique veículos e receba propostas." 
                badge="Marketplace" 
                iconSrc="/assets/plataformas.png" 
              />
              */}

              <RoleSelectionCard 
                onClick={() => handleAnswer("role", "fleet_management")} 
                label="Gestão Completa" 
                description="Controle frota, pagamentos, checklists." 
                badge="Gestão" 
                iconSrc="/assets/checklist.png" 
              />
              
              <FeaturePreviewModal open={showFeatureModal} onOpenChange={setShowFeatureModal} />
            </motion.div>
          )}

          {step === 2 && respostas.role === 'fleet_management' && (
            <motion.div key="step2-management" {...slideVariants} className="space-y-6 pt-4">
              <button onClick={() => setStep(prev => prev - 1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <h2 className="text-2xl font-black">Qual o tamanho da sua frota?</h2>
              {["Até 5 veículos", "Até 20 veículos", "Mais de 20 veículos"].map(size => (
                 <Button key={size} onClick={() => handleAnswer("fleetSize", size)} className="w-full h-14 rounded-2xl">{size}</Button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...slideVariants} className="space-y-6 pt-4">
              <button onClick={() => setStep(prev => prev - 1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <h2 className="text-2xl font-black">Dados Básicos</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                 <Input placeholder="Nome" value={respostas.nome || ""} onChange={(e) => setRespostas(prev => ({ ...prev, nome: e.target.value }))} className="h-14 rounded-2xl bg-white" />
                 <Input placeholder="WhatsApp" value={formatarWhatsapp(respostas.whatsapp || "")} onChange={(e) => { const raw = e.target.value.replace(/\D/g, "").slice(0, 11); setRespostas(prev => ({ ...prev, whatsapp: raw })); }} className="h-14 rounded-2xl bg-white" />
                 <Button type="submit" className="w-full h-14 rounded-2xl">Continuar</Button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div key="step4" {...slideVariants} className="space-y-4 pt-4">
                <button onClick={() => setStep(prev => prev - 1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <h2 className="text-2xl font-black">Escolha o seu plano</h2>
                {respostas.role === 'marketplace_owner' ? (
                  <>
                    <PlanCard
                      onClick={() => handleAnswer("plan", "marketplace-free")}
                      title="Plano Marketplace Free"
                      price="Gratuito"
                      iconSrc="/assets/logoMarketplacefree.png"
                      description="Permite até 1 anúncio ativo."
                    />
                    <PlanCard
                      onClick={() => handleAnswer("plan", "marketplace-pro")}
                      title="Plano Marketplace Pro"
                      price="R$ 119/mês"
                      iconSrc="/assets/logoMarketplacepro.png"
                      description="Permite até 10 anúncios ativos."
                    />
                    <PlanCard
                      onClick={() => handleAnswer("plan", "marketplace-elite")}
                      title="Plano Marketplace Elite"
                      price="R$ 299/mês"
                      iconSrc="/assets/logoMarketplaceelite.png"
                      description="Permite até 25 anúncios ativos."
                    />
                  </>
                ) : (
                  <>
                    {!alreadyUsedTrial && (
                      <PlanCard
                        onClick={handleSelectTrial}
                        title="Teste 7 Dias Grátis"
                        price="Gratuito"
                        iconSrc="/assets/logoGestaog7dias.png"
                        description="Experimente todas as ferramentas básicas."
                      />
                    )}
                    <PlanCard
                      onClick={() => handleAnswer("plan", "gestao-basico")}
                      title="Plano Gestão Básico"
                      price="R$ 199/mês"
                      iconSrc="/assets/logoGestaoBasico.png"
                      description="Para pequenas operações."
                    />
                    <PlanCard
                      onClick={() => handleAnswer("plan", "gestao-pro")}
                      title="Plano Gestão Pro"
                      price="R$ 399/mês"
                      iconSrc="/assets/logoGestaopro.png"
                      description="Para operações em crescimento."
                    />
                    <PlanCard
                      onClick={() => handleAnswer("plan", "gestao-master")}
                      title="Plano Gestão Master"
                      price="R$ 799/mês"
                      iconSrc="/assets/logoGestaomaster.png"
                      description="Para locadoras estruturadas."
                    />
                  </>
                )}
             </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" {...slideVariants} className="space-y-6 pt-4 text-center">
              <button onClick={() => setStep(prev => prev - 1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <h2 className="text-2xl font-black">Tudo pronto!</h2>
              <p>Sua conta está preparada.</p>
              <Button
                onClick={handleFinalSubmit}
                disabled={saveOnboarding.isPending}
                className="w-full h-14 rounded-2xl"
              >
                {saveOnboarding.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <img src="/assets/loading-carcontrol-coelho.gif" alt="Carregando" className="h-8 w-8 object-contain" />
                    Processando...
                  </span>
                ) : (
                  "Vamos nessa!"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default OnboardingCadastro;
