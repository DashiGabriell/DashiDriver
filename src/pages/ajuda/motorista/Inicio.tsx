import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  Grid,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando o Início",
    descricao: "Abra o aplicativo mobile. A tela inicial é exibida com saudação personalizada, KPIs financeiros e atalhos rápidos.",
    icone: <Smartphone className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo os KPIs",
    descricao: "Os cards no topo mostram: Recebimento Previsto, Valores Recebidos, A Receber e Valores Atrasados. Cada card é atualizado em tempo real.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Usando os atalhos rápidos",
    descricao: "A seção 'Atalhos' oferece acesso direto a Checklists, Frota, Motoristas e Veículos. Toque para navegar rapidamente.",
    icone: <Grid className="w-5 h-5" />,
  },
  {
    titulo: "Navegando pelo bottom nav",
    descricao: "O menu inferior (bottom nav) permite alternar entre Início, Checklists, Frota, Alertas e Perfil.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
  {
    titulo: "Acessando notificações",
    descricao: "Toque no sino de notificações no cabeçalho para ver alertas de documentos, manutenção e pagamentos.",
    icone: <TrendingUp className="w-5 h-5" />,
  },
];

const dicas = [
  "Os KPIs são atualizados automaticamente em tempo real.",
  "Use os atalhos rápidos para economizar tempo no dia a dia.",
  "O bottom nav está sempre disponível para navegação rápida.",
  "Personalize os atalhos nas configurações do aplicativo.",
  "Monitore os valores atrasados para tomar ações preventivas.",
];

const AjudaInicio = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Início</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-cyan-500" />
          Início
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Dashboard principal com KPIs financeiros em tempo real e atalhos para as principais funcionalidades.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            Visão Geral
          </h2>
          <div className="neu p-6 bg-card border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A tela Início é o ponto de partida do aplicativo mobile. Aqui você encontra um resumo financeiro com indicadores atualizados em tempo real e atalhos para navegar rapidamente entre as funcionalidades.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-cyan-500" />
            Passo a Passo
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="neu p-5 bg-card border flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 grid place-items-center text-cyan-500 shrink-0 mt-0.5">
                  {step.icone}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-cyan-500 uppercase tracking-widest">Passo {index + 1}</span>
                  </div>
                  <h3 className="font-display text-base font-bold mb-1">{step.titulo}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Dicas Importantes
          </h2>
          <div className="neu p-6 bg-card border">
            <ul className="space-y-3">
              {dicas.map((dica, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                  {dica}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AjudaInicio;
