import {
  LayoutDashboard,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  MessageCircle,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando o Portal do Lojista",
    descricao: "No menu lateral, clique em 'Portal do Lojista' ou navegue pela rota /lojista/hub. O dashboard exibe KPIs e oportunidades disponíveis.",
    icone: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo os KPIs",
    descricao: "O topo da página mostra indicadores: oportunidades disponíveis, interações realizadas, leads ativados, vendas confirmadas e taxa de conversão. Cada card atualiza em tempo real.",
    icone: <TrendingUp className="w-5 h-5" />,
  },
  {
    titulo: "Navegando pelas oportunidades",
    descricao: "Abaixo dos KPIs, uma tabela lista as oportunidades com detalhes como locadora, modelo, quantidade e orçamento. Clique para expandir e ver mais informações.",
    icone: <Target className="w-5 h-5" />,
  },
  {
    titulo: "Acessando ferramentas",
    descricao: "O menu de navegação do lojista dá acesso rápido a estoque, analytics e configurações. Tudo que você precisa está a poucos cliques.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando interações",
    descricao: "Veja o histórico de interações com locadoras interessadas nos seus veículos. Cada interação registra data, locadora e status do contato.",
    icone: <MessageCircle className="w-5 h-5" />,
  },
];

const dicas = [
  "Acesse o hub diariamente para não perder novas oportunidades de negócio.",
  "A taxa de conversão é o KPI mais importante — foque em melhorá-la.",
  "Mantenha seu estoque atualizado para gerar oportunidades mais relevantes.",
  "Responda rapidamente às interações para aumentar sua taxa de conversão.",
];

const AjudaHub = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Portal do Lojista</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-cyan-500" />
          Portal do Lojista
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          O hub central do lojista reúne KPIs, oportunidades e acesso rápido a todas as ferramentas do portal em um só lugar.
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
              O Portal do Lojista é o ponto de partida para todas as operações. Aqui você acompanha oportunidades de negócio, métricas de desempenho e acessa rapidamente as principais ferramentas do portal.
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

export default AjudaHub;
