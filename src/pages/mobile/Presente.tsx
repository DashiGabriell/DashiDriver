// @ts-nocheck
import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { 
  Shield, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  FileText, 
  ClipboardCheck, 
  Table, 
  Building, 
  User, 
  Phone, 
  Download,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// âœ… Schema de validação com Zod (Squad Dashi - Input Validation)
const whatsappSchema = z.string()
  .min(11, "WhatsApp deve ter 11 dígitos")
  .max(11, "WhatsApp deve ter 11 dígitos")
  .regex(/^\d{11}$/, "WhatsApp deve conter apenas números (DD + número)");

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  locadora: z.string().min(2, "Nome da locadora é obrigatório"),
  whatsapp: whatsappSchema,
  frota: z.string().min(1, "Tamanho da frota é obrigatório"),
});

// Tipagem para as respostas
interface Respostas {
  pergunta1: string;
  pergunta2: string;
  pergunta3: string;
  pergunta4: string;
  nome: string;
  locadora: string;
  whatsapp: string;
  frota: string;
}

// âœ… Função para formatar WhatsApp (DD + 9 dígitos = 11 total)
// Remove caracteres não numéricos e limita a 11 dígitos
const formatarWhatsapp = (valor: string): string => {
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, "");
  
  // Limita a 11 dígitos (DD + 9 dígitos)
  const limitado = apenasNumeros.slice(0, 11);
  
  // Formata como (DD) 9XXXX-XXXX
  if (limitado.length <= 2) {
    return limitado;
  } else if (limitado.length <= 7) {
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
  } else {
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7, 11)}`;
  }
};

// âœ… Função para extrair apenas números do WhatsApp
const extrairNumeros = (valor: string): string => {
  return valor.replace(/\D/g, "");
};

// Componente de Botão do Quiz memoizado para performance
const QuizButton = memo(({ 
  onClick, 
  label, 
  icon: Icon, 
  color 
}: { 
  onClick: () => void; 
  label: string; 
  icon: any;
  color?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full p-5 rounded-2xl neu-sm hover:neu-button transition-all active:scale-[0.97] text-left flex items-center justify-between group bg-card"
  >
    <div className="flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-bold text-sm leading-tight max-w-[200px]">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
  </button>
));

QuizButton.displayName = "QuizButton";

const PresenteFunnel = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [respostas, setRespostas] = useState<Partial<Respostas>>({});
  const [score, setScore] = useState(0);
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

  // Efeito para atualizar a barra de progresso
  useEffect(() => {
    if (step >= 1 && step <= 4) {
      setProgresso((step - 1) * 25);
    } else if (step > 4) {
      setProgresso(100);
    }
  }, [step]);

  const handleNextStep = useCallback(() => {
    setStep(prev => prev + 1);
  }, []);

  const handleAnswer = useCallback((key: keyof Respostas, value: string) => {
    setRespostas(prev => ({ ...prev, [key]: value }));
    setStep(prev => prev + 1);
    
    // Pixel Event Mock: No primeiro passo, disparar evento de engajamento
    if (step === 1) {

    }
  }, [step]);

  const calculateScore = useCallback(() => {
    let currentScore = 100;
    
    if (respostas.pergunta1 === "Não tenho certeza / Não possui") currentScore -= 20;
    if (respostas.pergunta2 !== "Uso um software completo") currentScore -= 25;
    if (respostas.pergunta3 === "Não, confio na CNH e Serasa padrão") currentScore -= 20;
    if (respostas.pergunta4 === "Infelizmente já aconteceu / Não tenho esse controle estrito") currentScore -= 10;
    
    setScore(Math.max(25, currentScore));
  }, [respostas]);

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // âœ… Limpar erros anteriores
    setErrosValidacao({});
    
    // âœ… Validar com Zod (Squad Dashi - Input Validation)
    try {
      const dadosValidados = formSchema.parse({
        nome: respostas.nome || "",
        locadora: respostas.locadora || "",
        whatsapp: extrairNumeros(respostas.whatsapp || ""), // Extrai apenas números
        frota: respostas.frota || "",
      });

      // Se passou na validação, enviar dados
      const webhookUrl = import.meta.env.VITE_WEBHOOK_LEADS_URL;
      if (!webhookUrl) throw new Error("VITE_WEBHOOK_LEADS_URL not configured");

      // Formatar data/hora no padrão DD/MM/AAAA, HH:MM:SS
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${
        String(now.getMonth() + 1).padStart(2, "0")}/${
        now.getFullYear()
      }, ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      const payload = {
        nome: dadosValidados.nome,
        locadora: dadosValidados.locadora,
        whatsapp: dadosValidados.whatsapp,
        frota: dadosValidados.frota,
        // Incluir respostas das perguntas do quiz
        pergunta1: respostas.pergunta1,
        pergunta2: respostas.pergunta2,
        pergunta3: respostas.pergunta3,
        pergunta4: respostas.pergunta4,
        data_hora: formattedDate,
      };

      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => {

      });

      setStep(6);
      calculateScore();

      
      toast({
        title: "Diagnóstico Concluído!",
        description: "Seu score foi calculado com sucesso.",
      });
    } catch (error) {
      // âœ… Capturar erros de validação do Zod
      if (error instanceof z.ZodError) {
        const novoErros: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const campo = err.path[0] as string;
          novoErros[campo] = err.message;
        });
        
        setErrosValidacao(novoErros);
        
        // Mostrar toast com erro principal
        const primeiroErro = error.errors[0];
        toast({
          title: "Erro na validação",
          description: primeiroErro.message,
          variant: "destructive"
        });
      }
    }
  };

  // Variantes de animação otimizadas
  const slideVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // âœ… Animação de pulsar leve para CTA
  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.02, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-safe safe-top pb-safe safe-bottom overflow-x-hidden">
      {/* Header Minimalista - Otimizado para Mobile com Logo Real */}
      <header className="w-full max-w-lg mb-6 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            <img 
              src="/assets/cabeca.png" 
              alt="DashiDrive Logo" 
              className="relative w-10 h-10 object-contain drop-shadow-sm"
            />
          </div>
          <span className="font-display font-black text-xl tracking-tighter uppercase">DashiDrive</span>
        </div>
        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-muted/20 border-muted-foreground/20 px-2 py-1 gap-1 flex items-center">
          <Lock className="w-2.5 h-2.5" />
          Seguro
        </Badge>
      </header>

      <main className="w-full max-w-lg flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* PASSO 0: Landing Page */}
          {step === 0 && (
            <motion.div 
              key="step0" 
              {...slideVariants} 
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8 text-center flex flex-col h-full justify-center"
            >
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge className="bg-sunset-start/10 text-sunset-start border-sunset-start/20 py-1.5 px-5 text-[10px] font-black tracking-widest rounded-full uppercase">
                    Exclusivo: Locadoras de SP
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black leading-[0.95] tracking-tighter">
                  SUA LOCADORA ESTÁ <span className="text-primary italic underline decoration-wavy decoration-primary/30 underline-offset-4">PROTEGIDA</span> CONTRA CALOTES?
                </h1>
                <p className="text-muted-foreground text-lg font-medium leading-tight px-4">
                  Leve 2 minutos para medir o <strong className="text-foreground">Score de Saúde Operacional</strong> e desbloqueie o Kit de Sobrevivência Jurídica.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 px-2">
                {[
                  { icon: FileText, label: "Contrato Blindado", color: "bg-blue-500/10 text-blue-600" },
                  { icon: Table, label: "Tabela Rodízio", color: "bg-amber-500/10 text-amber-600" },
                  { icon: ClipboardCheck, label: "Checklist E/S", color: "bg-emerald-500/10 text-emerald-600" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center neu shadow-sm", item.color)}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter leading-none text-center h-4">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 px-2">
                <Button 
                  onClick={handleNextStep}
                  variant="sunset"
                  size="lg" 
                  className="w-full h-20 text-xl font-black rounded-3xl shadow-2xl shadow-sunset-start/30 uppercase tracking-tight animate-pulse-subtle group"
                >
                  Iniciar Diagnóstico
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="mt-4 text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  TOTALMENTE GRATUITO E SEGURO
                </p>
              </div>
            </motion.div>
          )}

          {/* PASSOS 1-4: Quiz */}
          {(step >= 1 && step <= 4) && (
            <motion.div 
              key={`step${step}`} 
              {...slideVariants} 
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Passo {step}/4
                  </span>
                  <span className="text-[10px] font-black text-primary uppercase">
                    {progresso}% COMPLETO
                  </span>
                </div>
                <Progress value={progresso} className="h-2 rounded-full" />
              </div>

              <Card className="neu-sm border-none overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="pt-8 text-center px-6">
                  <CardTitle className="text-2xl md:text-3xl font-display font-black leading-tight tracking-tighter">
                    {step === 1 && "Seu contrato possui cláusula de responsabilidade solidária para multas?"}
                    {step === 2 && "Como é feito o controle de rodízio de placas e manutenção hoje?"}
                    {step === 3 && "Você faz background check do motorista além do Serasa?"}
                    {step === 4 && "Sua locadora já perdeu garantia por passar da quilometragem da revisão?"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pb-10 pt-6 px-6">
                  {step === 1 && (
                    <>
                      <QuizButton onClick={() => handleAnswer("pergunta1", "Sim, está 100% atualizado")} label="Sim, está 100% atualizado" icon={CheckCircle2} color="text-success" />
                      <QuizButton onClick={() => handleAnswer("pergunta1", "Não tenho certeza / Não possui")} label="Não tenho certeza / Não possui" icon={AlertCircle} color="text-destructive" />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <QuizButton onClick={() => handleAnswer("pergunta2", "Uso planilha/papel")} label="Uso planilha ou papel" icon={FileText} />
                      <QuizButton onClick={() => handleAnswer("pergunta2", "Faço de cabeça")} label="Faço de cabeça" icon={Zap} />
                      <QuizButton onClick={() => handleAnswer("pergunta2", "Uso um software completo")} label="Uso um software completo" icon={Smartphone} color="text-primary" />
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <QuizButton onClick={() => handleAnswer("pergunta3", "Sim, analiso histórico completo")} label="Sim, analiso histórico completo" icon={CheckCircle2} color="text-success" />
                      <QuizButton onClick={() => handleAnswer("pergunta3", "Não, confio na CNH e Serasa padrão")} label="Não, confio na CNH e Serasa" icon={AlertCircle} color="text-destructive" />
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <QuizButton onClick={() => handleAnswer("pergunta4", "Nunca perdi")} label="Nunca perdi" icon={CheckCircle2} color="text-success" />
                      <QuizButton onClick={() => handleAnswer("pergunta4", "Infelizmente já aconteceu / Não tenho esse controle estrito")} label="Infelizmente já aconteceu" icon={AlertCircle} color="text-destructive" />
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PASSO 5: Captura */}
          {step === 5 && (
            <motion.div 
              key="step5" 
              {...slideVariants} 
              transition={{ duration: 0.4 }}
              className="w-full space-y-6 pt-4"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-success/10 text-success flex items-center justify-center mx-auto neu-sm border-2 border-success/20">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-black tracking-tighter uppercase">Quase lá!</h2>
                  <p className="text-muted-foreground text-sm font-medium leading-tight px-6">
                    Seu diagnóstico foi gerado. Insira seus dados para <strong className="text-foreground uppercase tracking-widest text-xs">Calcular o Score</strong> e liberar o Kit.
                  </p>
                </div>
              </div>

              <Card className="neu-sm border-none shadow-none bg-card/40">
                <CardContent className="p-6">
                  <form onSubmit={handleFinalSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="nome" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Seu Nome</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="nome" 
                          placeholder="Digite seu nome" 
                          className="pl-12 h-14 rounded-2xl bg-background/50 border-none neu-sm focus-visible:ring-primary"
                          value={respostas.nome || ""}
                          onChange={(e) => setRespostas(prev => ({ ...prev, nome: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="locadora" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome da Locadora</Label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="locadora" 
                          placeholder="Ex: Locadora Central" 
                          className="pl-12 h-14 rounded-2xl bg-background/50 border-none neu-sm focus-visible:ring-primary"
                          value={respostas.locadora || ""}
                          onChange={(e) => setRespostas(prev => ({ ...prev, locadora: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="whatsapp" 
                          type="tel"
                          placeholder="(11) 99999-9999" 
                          className={cn(
                            "pl-12 h-14 rounded-2xl bg-background/50 border-none neu-sm focus-visible:ring-primary",
                            errosValidacao.whatsapp && "ring-2 ring-destructive focus-visible:ring-destructive"
                          )}
                          value={formatarWhatsapp(respostas.whatsapp || "")}
                          onChange={(e) => {
                            const valor = e.target.value;
                            setRespostas(prev => ({ ...prev, whatsapp: valor }));
                            // Limpar erro ao usuário começar a digitar
                            if (errosValidacao.whatsapp) {
                              setErrosValidacao(prev => {
                                const novo = { ...prev };
                                delete novo.whatsapp;
                                return novo;
                              });
                            }
                          }}
                          maxLength={15} // (11) 97866-5790 = 15 caracteres
                          required
                        />
                        {/* âœ… Indicador visual de validação */}
                        {extrairNumeros(respostas.whatsapp || "").length === 11 && !errosValidacao.whatsapp && (
                          <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                        )}
                      </div>
                      {/* âœ… Mensagem de erro de validação */}
                      {errosValidacao.whatsapp && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                          <span className="text-xs font-semibold text-destructive">{errosValidacao.whatsapp}</span>
                        </div>
                      )}
                      {/* âœ… Dica de formato */}
                      <p className="text-[9px] text-muted-foreground font-medium ml-1 mt-1">
                        DD + número (11 dígitos, apenas números)
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="frota" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tamanho da Frota</Label>
                      <Select 
                        onValueChange={(val) => setRespostas(prev => ({ ...prev, frota: val }))}
                        required
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-background/50 border-none neu-sm focus:ring-primary">
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none neu shadow-2xl">
                          <SelectItem value="1 a 5 carros">1 a 5 carros</SelectItem>
                          <SelectItem value="6 a 15 carros">6 a 15 carros</SelectItem>
                          <SelectItem value="Mais de 15 carros">Mais de 15 carros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="sunset" type="submit" className="w-full h-16 text-lg font-black rounded-2xl mt-4 group shadow-xl shadow-sunset-start/20">
                      CALCULAR MEU SCORE
                      <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PASSO 6: Resultados */}
          {step === 6 && (
            <motion.div 
              key="step6" 
              {...slideVariants} 
              transition={{ duration: 0.5 }}
              className="w-full space-y-8 pb-12 pt-4"
            >
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-display font-black tracking-tighter uppercase">Seu Resultado</h2>
                
                {/* Score Visual Premium */}
                <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="transparent"
                      className="text-muted/10"
                    />
                    <motion.circle
                      cx="112"
                      cy="112"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="transparent"
                      strokeDasharray={565.2}
                      initial={{ strokeDashoffset: 565.2 }}
                      animate={{ strokeDashoffset: 565.2 - (565.2 * score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        score < 50 ? "text-destructive" : score < 80 ? "text-amber-500" : "text-success"
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="text-6xl font-display font-black tracking-tighter"
                    >
                      {score}%
                    </motion.span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Proteção</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <motion.div
                    variants={pulseVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <Badge 
                      className={cn(
                        "py-2 px-6 text-sm font-black rounded-full uppercase tracking-widest border-2",
                        score < 50 ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        score < 80 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        "bg-success/10 text-success border-success/20"
                      )}
                    >
                      {score < 50 ? "Risco Crítico" : score < 80 ? "Risco Moderado" : "Segurança Máxima"}
                    </Badge>
                  </motion.div>
                </div>
              </div>

              {/* Diagnóstico Rápido */}
              <div className="space-y-4">
                <div className={cn("p-5 rounded-3xl border-l-8 neu-sm", score < 50 ? "border-destructive bg-destructive/5" : "border-amber-500 bg-amber-500/5")}>
                  <div className="flex gap-4">
                    <div className={cn("w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center bg-background", score < 50 ? "text-destructive" : "text-amber-500")}>
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest opacity-60">Diagnóstico:</p>
                      <p className="text-sm font-bold leading-snug">
                        {respostas.pergunta2 === "Uso planilha/papel" 
                          ? "Gerenciar rodízio em planilhas causa prejuízo médio de R$ 4.200,00/ano em multas esquecidas."
                          : "A falta de verificação automatizada de condutores aumenta o risco de calotes em 34%."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="sunset" className="w-full h-20 rounded-3xl font-black text-lg neu shadow-2xl shadow-sunset-start/30 group uppercase tracking-tight">
                  <Download className="mr-3 w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                  Receber Kit de Sobrevivência
                </Button>
              </div>

              {/* Gancho do SaaS DashiDrive */}
              <Card className="neu-sm border-2 border-primary/20 bg-primary/5 overflow-hidden rounded-3xl relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-24 h-24 rotate-12" />
                </div>
                <CardContent className="p-7 space-y-6 relative z-10">
                  <div className="flex items-center gap-2 text-primary">
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">DashiDrive Premium</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-display font-black leading-none tracking-tighter uppercase">Que tal automatizar tudo isso?</h3>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      A DashiDrive resolve os pontos fracos do seu diagnóstico com <strong>alertas de rodízio</strong>, <strong>contratos digitais</strong> e <strong>background check</strong> instantâneo.
                    </p>
                  </div>
                  <motion.div
                    variants={pulseVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <Button 
                      onClick={() => window.location.href = "/onboarding?ref=funnel&name=" + (respostas.nome || "")} 
                      variant="sunset" 
                      className="w-full h-16 rounded-2xl font-black text-md neu shadow-lg shadow-sunset-start/20 group"
                    >
                      Testar Grátis por 7 dias
                      <Star className="ml-2 w-4 h-4 fill-current group-hover:rotate-45 transition-transform" />
                    </Button>
                  </motion.div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted neu-sm" />)}
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">+191 locadores ativos em SP</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Minimalista Otimizado */}
      <footer className="w-full max-w-lg mt-auto pt-10 pb-6 text-center space-y-6 border-t border-muted/20">
        <div className="flex justify-center items-center gap-6 opacity-40 grayscale">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">LGPD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">SP/BR</span>
          </div>
        </div>
        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto opacity-30">
          DashiDrive © 2026 - Tecnologia de Ponta para Gestão de Frotas Independente.
        </p>
      </footer>
    </div>
  );
};

export default PresenteFunnel;
