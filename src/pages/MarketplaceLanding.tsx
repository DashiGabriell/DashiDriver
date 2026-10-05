import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  ShoppingBag,
  Search,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useAuth } from "@/integrations/supabase/auth";
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

const MarketplaceLanding = () => {
  const { session } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const plans = [
    {
      name: "Marketplace FREE",
      slug: "marketplace-free",
      description: "Ideal para usuários iniciais testarem a plataforma.",
      price: 0,
      buttonText: "Começar Grátis",
      buttonVariant: "outline" as const,
      features: [
        "Até 1 anúncio ativo",
        "Perfil público básico",
        "Recebimento de propostas",
        "Sem métricas de performance",
        "Sem destaque nas buscas",
        "Sem selo de verificado"
      ],
      color: "success"
    },
    {
      name: "Marketplace PRO",
      slug: "marketplace-pro",
      description: "Para locadoras que buscam maior profissionalismo e controle.",
      price: 119,
      buttonText: "Profissionalizar Agora",
      buttonVariant: "default" as const,
      popular: true,
      features: [
        "Até 10 anúncios ativos",
        "Selo de Perfil Verificado",
        "Painel 'Meus Anúncios'",
        "Métricas básicas de cliques",
        "Gestão de propostas",
        "Suporte prioritário"
      ],
      color: "sunset"
    },
    {
      name: "Marketplace ELITE",
      slug: "marketplace-elite",
      description: "Para locadoras que buscam performance máxima e escala.",
      price: 299,
      buttonText: "Dominar o Mercado",
      buttonVariant: "outline" as const,
      features: [
        "Até 25 anúncios ativos",
        "Destaque na Home e Buscas",
        "Prioridade em recomendações",
        "Métricas completas",
        "Perfil Premium/VIP",
        "Exposição máxima"
      ],
      color: "yellow"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    document.documentElement.classList.add('scrollbar-thin', 'scrollbar-thumb-blue', 'scrollbar-track-transparent');
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
    <div className="min-h-screen bg-background font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-background/80 backdrop-blur-md border-b' : 'py-6 bg-transparent'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/lp-marketplace" className="flex items-center gap-2 group">
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
            <a href="#vantagens" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Vantagens</a>
            <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planos</a>
            <Link to="/marketplace/home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Ver Vitrine</Link>
          </div>

          <Link to={session ? "/marketplace/home" : "/login"}>
            <Button variant="outline" className="neu-interactive px-6 font-semibold border-none bg-background shadow-neu-sm hover:shadow-neu">
              {session ? "Entrar na Loja" : "Criar Anúncio"}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sunset-start/10 rounded-full blur-[120px] animate-pulse-soft delay-1000" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Coluna Esquerda - Texto */}
            <motion.div {...fadeIn}>

              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-balance leading-[0.9]">
                ALUGUE SEUS CARROS <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">3X MAIS RÁPIDO</span>
              </h1>
              <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 text-balance leading-relaxed">
                Conectamos sua frota diretamente a motoristas qualificados de aplicativos e particulares. Mais visibilidade, propostas qualificadas e contratos fechados em tempo recorde.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link to="/marketplace/home">
                  <Button className="h-14 px-8 text-lg font-bold bg-gradient-sunset hover:bg-gradient-sunset-hover text-white rounded-2xl shadow-neu-accent hover:scale-105 active:scale-95 transition-all group">
                    Anunciar Veículo Agora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Coluna Direita - Imagem Ilustrativa */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="neu p-2 bg-white/50 backdrop-blur-sm border rounded-[2.5rem]">
                <img 
                  src="/assets/carroAmarelo.png" 
                  alt="Marketplace Preview" 
                  className="w-full h-auto object-contain"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 animate-bounce-subtle">
                <div className="neu p-4 bg-white border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Locadora</div>
                    <div className="text-sm font-black">VERIFICADA</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-12 border-y bg-muted/30 relative">
        <AnimatedBanner 
          text="DashiDrive: Onde motoristas encontram os melhores carros!            " 
          direction="left" 
          bgColor="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        />
        
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">120+</div>
              <div className="text-sm font-medium text-muted-foreground">Motoristas Ativos</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">Muitos</div>
              <div className="text-sm font-medium text-muted-foreground">Anúncios Novos/Mês</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">Alta</div>
              <div className="text-sm font-medium text-muted-foreground">Taxa de Locação</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-black mb-1">60%</div>
              <div className="text-sm font-medium text-muted-foreground">Mais Conversão</div>
            </div>
          </div>
        </div>

        <AnimatedBanner 
          text="Destaque sua frota hoje mesmo e fature mais com a DashiDrive!            " 
          direction="right" 
          bgColor="bg-gradient-to-r from-sunset-start to-sunset-end"
        />
      </section>

      {/* Features/Vantagens Section */}
      <section id="vantagens" className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[0.9]">
              FERRAMENTAS PARA <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">VENDER MAIS</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Não somos apenas um classificado. Somos uma máquina de gerar propostas reais para sua locadora.
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
                icon: <Search className="w-8 h-8" />,
                title: "Busca Inteligente",
                description: "Filtros avançados que levam o motorista certo exatamente para o veículo que você oferece."
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Perfil Verificado",
                description: "Aumente em até 60% a confiança dos motoristas com o selo de autenticidade DashiDrive."
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Gestão de Propostas",
                description: "Receba e analise propostas diretamente no painel, com histórico e perfil do motorista."
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Métricas de Performance",
                description: "Saiba quantas pessoas viram seu anúncio e ajuste sua estratégia para converter mais."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Exposição Premium",
                description: "Colocamos seus carros no topo das buscas e na home da plataforma para máxima exposição."
              },
              {
                icon: <ShoppingBag className="w-8 h-8" />,
                title: "Vitrine Mobile",
                description: "Interface ultra-rápida e otimizada para motoristas que buscam carros pelo celular."
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeIn} className="neu-interactive p-8 bg-card group">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 grid place-items-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
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
              PLANOS QUE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">IMPULSIONAM</span> <br className="md:hidden" /> SEU FATURAMENTO
            </motion.h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Selecione o nível de exposição ideal para o tamanho da sua frota. Independente do sistema de gestão.
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
                    ? "bg-gradient-to-b from-blue-600 to-blue-800 shadow-neu-accent scale-105 z-10" 
                    : plan.color === "success" ? "bg-card border border-success/20" : "bg-card border border-yellow/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Custo-Benefício Imbatível
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
                      plan.color === "sunset" ? "bg-blue-500/10 text-blue-600" : "bg-yellow/10 text-yellow"
                    )}>
                      {plan.name === "Marketplace FREE" ? "Gratuito para Sempre" : plan.name === "Marketplace PRO" ? "Mais Popular" : "Exposição Total"}
                    </div>
                    <h3 className="font-display text-3xl font-black mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8 overflow-hidden h-14">
                    <span className="text-2xl font-bold text-muted-foreground">R$</span>
                    <div className="relative">
                      <motion.span 
                        initial={{ y: 0, opacity: 1 }}
                        className="text-5xl font-black block"
                      >
                        {plan.price}
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
                          plan.color === "sunset" ? "bg-blue-500/10 text-blue-600" : "bg-yellow/10 text-yellow"
                        )}>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link to={session ? `/checkout/${plan.slug}` : "/login"}>
                      <Button 
                        variant={plan.buttonVariant} 
                        className={cn(
                          "w-full h-14 rounded-2xl font-bold transition-all shadow-md active:scale-95",
                          plan.popular 
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-none" 
                            : plan.color === "success" 
                              ? "border-success/30 hover:bg-success hover:text-white" 
                              : "border-yellow/30 hover:bg-yellow hover:text-white"
                        )}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-10" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="neu p-6 xs:p-10 sm:p-12 md:p-24 text-center max-w-5xl mx-auto bg-card border overflow-hidden">
            <h2 className="font-display text-xl xs:text-3xl sm:text-4xl md:text-7xl font-black tracking-tight mb-6 md:mb-8 leading-[1.2] xs:leading-[1.1] md:leading-[0.9] break-words uppercase">
              SUA FROTA NÃO PODE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">FICAR PARADA</span>
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Junte-se a centenas de locadoras que já estão alugando veículos em minutos através do DashiDrive.
            </p>
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 text-base xs:text-lg md:text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-neu hover:scale-105 active:scale-95 transition-all">
                Criar Anúncio Grátis
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
              <Link to="/lp-marketplace" className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-8 h-8 text-blue-500" />
                <span className="font-display text-2xl font-bold tracking-tight">Dashi<span className="text-blue-500">Drive</span></span>
              </Link>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                A vitrine oficial da DashiDrive. O lugar onde locadoras profissionais e motoristas qualificados fazem negócios reais.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Marketplace</h4>
              <ul className="space-y-4">
                <li><Link to="/marketplace/home" className="text-muted-foreground hover:text-foreground transition-colors">Buscar Veículos</Link></li>
                <li><Link to={session ? "/checkout/marketplace-free" : "/login"} className="text-muted-foreground hover:text-foreground transition-colors">Anunciar Frota</Link></li>
                <li><a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">Planos de Destaque</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Ajuda</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Como funciona?</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Dicas p/ Locadoras</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Suporte</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t text-sm text-muted-foreground">
            <p>© 2026 DashiDrive. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span>Foco em Performance e Visibilidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplaceLanding;
