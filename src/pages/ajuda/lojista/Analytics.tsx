import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PieChart,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Analytics",
    descricao: "No menu do lojista, clique em 'Analytics' ou navegue pela rota /lojista/analytics. O dashboard exibe gráficos e indicadores de desempenho.",
    icone: <BarChart3 className="w-5 h-5" />,
  },
  {
    titulo: "Visão geral de vendas",
    descricao: "O painel mostra o total de vendas no período, faturamento bruto, ticket médio e número de veículos vendidos. Filtre por dia, semana, mês ou ano.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Desempenho do estoque",
    descricao: "Veja gráficos de desempenho dos anúncios: visualizações por veículo, taxa de conversão (visualização → proposta) e tempo médio até a venda.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Análise de oportunidades",
    descricao: "Acompanhe quantas oportunidades você recebeu, quantas respondeu e a taxa de conversão em vendas. Identifique padrões para melhorar seus resultados.",
    icone: <TrendingUp className="w-5 h-5" />,
  },
  {
    titulo: "Comparativos",
    descricao: "Compare seu desempenho com períodos anteriores. O sistema gera gráficos comparativos mês a mês para vendas, visualizações e propostas.",
    icone: <PieChart className="w-5 h-5" />,
  },
  {
    titulo: "Exportando relatórios",
    descricao: "Exporte relatórios em PDF ou CSV para compartilhar com sua equipe ou para análise externa. Os dados podem ser filtrados por período.",
    icone: <Calendar className="w-5 h-5" />,
  },
];

const dicas = [
  "Analise semanalmente suas métricas para identificar tendências e ajustar estratégias.",
  "O ticket médio ajuda a entender o perfil dos seus compradores.",
  "Compare períodos para identificar sazonalidade nas vendas.",
  "Veículos com muitas visualizações mas poucas propostas podem ter o preço acima do mercado.",
  "Use os relatórios exportados para reuniões de planejamento comercial.",
];

const AjudaAnalytics = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Analytics</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cyan-500" />
          Analytics
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Dashboard completo com métricas de vendas, desempenho de anúncios e análises para otimizar seus resultados.
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
              O Analytics reúne todas as métricas do seu negócio em dashboards interativos. Acompanhe vendas, desempenho de anúncios e oportunidades em gráficos atualizados em tempo real.
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

export default AjudaAnalytics;
