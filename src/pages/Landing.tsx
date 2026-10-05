import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useAuth } from "@/integrations/supabase/auth";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";

// Componente de faixa animada
const AnimatedBanner = ({ text, direction, bgColor }: { text: string; direction: "left" | "right"; bgColor: string }) => {
  return (
    <div className={`w-full overflow-hidden ${bgColor} py-3 flex items-center`}>
      <div 
        className={`whitespace-nowrap flex items-center ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      >
        {Array(20).fill(text).map((t, i) => (
          <span key={i} className="text-white font-bold text-lg mx-8">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

// Componente de troca de faturamento
const PricingSwitch = ({
  onSwitch,
}: {
  onSwitch: (value: boolean) => void;
}) => {
  const [selected, setSelected] = useState(false);

  const handleSwitch = (value: boolean) => {
    setSelected(value);
    onSwitch(value);
  };
};

const Landing = () => {
  const { session } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "BÁSICO",
      description: "Focado em pequenas operações.",
      price: 199,
      slug: "gestao-basico",
      yearlyPrice: 159,
      buttonText: "Começar Agora",
      buttonVariant: "outline" as const,
      features: [
        "Até 5 veículos",
        "1 Usuário Admin",
        "Até 10 motoristas",
        "Até 10 checklists/mês",
        "Controle financeiro básico",
        "Suporte padrão"
      ],
      color: "success"
    },
    {
      name: "PRO",
      description: "Focado em operações em crescimento.",
      price: 399,
      slug: "gestao-pro",
      yearlyPrice: 319,
      buttonText: "Escalar Minha Locadora",
      buttonVariant: "default" as const,
      popular: true,
      features: [
        "Até 20 veículos",
        "Até 3 usuários",
        "Até 40 motoristas",
        "Checklists ilimitados",
        "Gestão de manutenção",
        "KPIs financeiros completos",
        "Suporte prioritário"
      ],
      color: "sunset"
    },
    {
      name: "MASTER",
      description: "Focado em locadoras estruturadas.",
      price: 799,
      slug: "gestao-master",
      yearlyPrice: 639,
      buttonText: "Falar com Especialista",
      buttonVariant: "outline" as const,
      features: [
        "Até 100 veículos",
        "Até 200 usuários",
        "Checklists ilimitados",
        "Operação multi-equipe",
        "Gestão avançada de anúncios",
        "Dashboard volume elevado",
        "Suporte VIP 24/7"
      ],
      color: "yellow"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Aplicar scrollbar azul na raiz do documento ao montar a landing page
    document.documentElement.classList.add('scrollbar-thin', 'scrollbar-thumb-blue', 'scrollbar-track-transparent');
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Remover scrollbar azul ao sair da página
      document.documentElement.classList.remove('scrollbar-thin', 'scrollbar-thumb-blue', 'scrollbar-track-transparent');
    };
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-yellow/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-background/80 backdrop-blur-md border-b' : 'py-6 bg-transparent'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 grid place-items-center rounded-xl group-hover:scale-110 transition-transform">
              <img 
                src="/assets/loading-carcontrol-coelho.gif" 
                alt="DashiDrive Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              Dashi<span className="text-blue-500">Drive</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planos</a>
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
          </div>

          <Link to={session ? "/dashboard" : "/login"}>
            <Button variant="outline" className="neu-interactive px-6 font-semibold border-none bg-background shadow-neu-sm hover:shadow-neu">
              {session ? "Dashboard" : "Entrar"}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-0 md:pt-28 md:pb-0 overflow-hidden min-h-screen">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sunset-start/10 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow/10 rounded-full blur-[120px] animate-pulse-soft delay-1000" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Coluna Esquerda - GIF */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center items-center gap-4"
            >
              <img 
                src="/assets/loading-carcontrol-coelho.gif" 
                alt="Hero Animation" 
                className="w-full max-w-sm h-auto object-contain"
              />
              <Link to={session ? "/dashboard" : "/login"}>
                <Button className="h-11 px-6 text-base font-bold bg-gradient-sunset hover:bg-gradient-sunset-hover text-white rounded-2xl shadow-neu-accent hover:scale-105 active:scale-95 transition-all group">
                  {session ? "Entrar na DashiDrive" : "Teste por 7 dias Grátis"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Coluna Direita - Texto */}
            <motion.div {...fadeIn}>
              <h1 className="font-display text-[2.4rem] md:text-[3.6rem] lg:text-[4.8rem] font-black tracking-tight mb-2 text-balance leading-[0.9]">
                SUA FROTA SOB <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">CONTROLE ABSOLUTO</span>
              </h1>
              <p className="max-w-2xl text-base md:text-lg text-muted-foreground mb-4 text-balance leading-relaxed">
                Abandone as planilhas. A DashiDrive é a solução definitiva para locadoras que buscam escala, segurança e lucratividade real através de dados inteligentes.
              </p>
              <a href="#funcionalidades">
                <Button variant="ghost" className="h-11 px-6 text-base font-semibold rounded-2xl hover:bg-foreground/5">
                  Ver Funcionalidades
                </Button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Dashboard Preview / Floating UI elements */}
        <div className="container mx-auto px-4 md:px-6 mt-4 md:mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="relative mx-auto max-w-4xl rounded-[2rem] p-2 bg-gradient-to-b from-border/50 to-transparent shadow-2xl"
          >
            <div className="overflow-hidden rounded-[1.5rem] bg-card border-4 border-background shadow-neu">
              <img 
                src="/assets/pc-smartphone.png" 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover aspect-video opacity-120"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Floating Cards (UI Flair) */}
              <div className="absolute -left-4 md:-left-8 top-1/4 animate-bounce-subtle">
                <div className="neu p-2 md:p-3 bg-card border">
                  <img src="/assets/up.png" alt="Lucratividade" className="text-sunset-start w-6 h-6 mb-1" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lucratividade</div>
                  <div className="text-base md:text-lg font-black">+240%</div>
                </div>
              </div>
              <div className="absolute -right-4 md:-right-8 bottom-1/4 animate-bounce-subtle delay-700">
                <div className="neu p-2 md:p-3 bg-card border">
                  <img src="/assets/escudo.png" alt="Segurança" className="text-success w-6 h-6 mb-1" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Segurança</div>
                  <div className="text-base md:text-lg font-black">RLS 2.0</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-12 border-y bg-muted/30 relative">
        {/* Faixa Azul Superior */}
        <AnimatedBanner 
          text="DashiDrive, gestão inteligente para locadoras!      -      " 
          direction="left" 
          bgColor="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        />
        
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">100+</div>
              <div className="text-sm font-medium text-muted-foreground">Veículos Gerenciados</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">Muitas</div>
              <div className="text-sm font-medium text-muted-foreground">Locadoras Ativas</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">1k+</div>
              <div className="text-sm font-medium text-muted-foreground">Checklists Realizados</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">+2Mil HORAS</div>
              <div className="text-sm font-medium text-muted-foreground">Economizadas</div>
            </div>
          </div>
        </div>

        {/* Faixa Laranja Inferior */}
        <AnimatedBanner 
          text="Profissionalize a gestão da sua Locadora com a DashiDrive!      -      " 
          direction="right" 
          bgColor="bg-gradient-to-r from-sunset-start to-sunset-end"
        />
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[0.9]">
              TUDO QUE VOCÊ PRECISA PARA <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">DOMINAR O MERCADO</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Desenvolvido por especialistas em frotas, para resolver os problemas reais do seu dia a dia operacional.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <img src="/assets/up.png" alt="Dashboard" className="w-8 h-8" />,
                title: "Dashboard em Tempo Real",
                description: "Visualize KPIs críticos, faturamento e ocupação da frota em um painel intuitivo e poderoso."
              },
              {
                icon: <img src="/assets/checklist.png" alt="Checklists" className="w-8 h-8" />,
                title: "Checklists Inteligentes",
                description: "Vistorias completas com fotos e geração automática de PDF profissional para enviar via WhatsApp."
              },
              {
                icon: <img src="/assets/smartphone.png" alt="Mobile" className="w-8 h-8" />,
                title: "Operação Mobile-First",
                description: "Sua equipe de campo resolve tudo pelo celular, com interface otimizada e ultra-veloz."
              },
              {
                icon: <img src="/assets/escudo.png" alt="Seguros" className="w-8 h-8" />,
                title: "Gestão de Seguros",
                description: "Controle parcelas de seguros e financiamentos sem nunca perder um vencimento."
              },
              {
                icon: <img src="/assets/motorista.png" alt="Motoristas" className="w-8 h-8" />,
                title: "Gestão de Motoristas",
                description: "Histórico completo, controle de CNH e documentação centralizada em um só lugar."
              },
              {
                icon: <img src="/assets/sino.png" alt="Alertas" className="w-8 h-8" />,
                title: "Alertas Automáticos",
                description: "Notificações inteligentes sobre manutenção, vencimentos e pendências financeiras."
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeIn} className="neu-interactive p-8 bg-card group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-sunset/10 grid place-items-center text-sunset-start mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24 space-y-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-7xl font-black tracking-tight leading-[1.1] md:leading-[0.9] text-balance"
            >
              PLANOS QUE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">IMPULSIONAM</span> <br className="md:hidden" /> SEU CRESCIMENTO
            </motion.h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Escolha o plano ideal para o momento da sua locadora. Sem taxas escondidas, sem surpresas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "neu p-1 flex flex-col h-full relative transition-transform hover:scale-[1.02]",
                  plan.popular 
                    ? "bg-gradient-to-b from-sunset-start to-sunset-end shadow-neu-accent scale-105 z-10" 
                    : plan.color === "success" ? "bg-card border border-success/20" : "bg-card border border-yellow/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-sunset-start text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Melhor Custo-Benefício
                  </div>
                )}
                
                <div className={cn(
                  "p-8 bg-card rounded-[calc(var(--radius)-4px)] flex-1 flex flex-col",
                  plan.popular && "rounded-b-none"
                )}>
                  <div className="mb-6">
                    <div className={cn(
                      "inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4",
                      plan.color === "success" ? "bg-success/10 text-success" : 
                      plan.color === "sunset" ? "bg-sunset-start/10 text-sunset-start" : "bg-yellow/10 text-yellow"
                    )}>
                      {plan.name === "BÁSICO" ? "Plano de Entrada" : plan.name === "PRO" ? "Recomendado" : "Premium"}
                    </div>
                    <h3 className="font-display text-3xl font-black mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8 overflow-hidden h-14">
                    <span className="text-2xl font-bold text-muted-foreground">R$</span>
                    <div className="relative">
                      <motion.span 
                        key={isYearly ? "yearly" : "monthly"}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-black block"
                      >
                        {isYearly ? plan.yearlyPrice : plan.price}
                      </motion.span>
                    </div>
                    <span className="text-muted-foreground">/mês</span>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          plan.color === "success" ? "bg-success/10 text-success" : 
                          plan.color === "sunset" ? "bg-sunset-start/10 text-sunset-start" : "bg-yellow/10 text-yellow"
                        )}>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link to={`/checkout/${plan.slug}`}>
                      <Button 
                        variant={plan.buttonVariant} 
                        className={cn(
                          "w-full h-14 rounded-2xl font-bold transition-all shadow-md active:scale-95",
                          plan.popular 
                            ? "bg-gradient-sunset hover:bg-gradient-sunset-hover text-white border-none" 
                            : plan.color === "success" 
                              ? "border-success/30 hover:bg-success hover:text-white" 
                              : "border-yellow/30 hover:bg-yellow hover:text-white"
                        )}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                    
                    {isYearly && (
                      <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium uppercase tracking-wider">
                        Cobrado anualmente (R$ {(isYearly ? plan.yearlyPrice : plan.price) * 12})
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sunset opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="neu p-6 xs:p-10 sm:p-12 md:p-24 text-center max-w-5xl mx-auto bg-card border overflow-hidden">
            <h2 className="font-display text-xl xs:text-3xl sm:text-4xl md:text-7xl font-black tracking-tight mb-6 md:mb-8 leading-[1.2] xs:leading-[1.1] md:leading-[0.9] break-words uppercase">
              PRONTO PARA <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">PROFISSIONALIZAR</span> SUA LOCADORA?
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Junte-se a centenas de locadoras que já estão operando com eficiência máxima e lucratividade real.
            </p>
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 text-base xs:text-lg md:text-xl font-bold bg-gradient-sunset hover:bg-gradient-sunset-hover text-white rounded-2xl shadow-neu-accent hover:scale-105 active:scale-95 transition-all">
                Criar Minha Conta Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 grid place-items-center rounded-xl">
                  <img 
                    src="/assets/loading-carcontrol-coelho.gif" 
                    alt="DashiDrive Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-display text-2xl font-bold tracking-tight">Dashi<span className="text-blue-500">Drive</span></span>
              </Link>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                A plataforma inteligente para gestão de frotas e locadoras. Tecnologia de ponta para quem busca resultados extraordinários.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Produto</h4>
              <ul className="space-y-4">
                <li><a href="#funcionalidades" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">Planos</a></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Entrar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Empresa</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t text-sm text-muted-foreground">
            <p>© 2026 DashiDrive. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span>Feito com ❤️ pela Squad Dashi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
