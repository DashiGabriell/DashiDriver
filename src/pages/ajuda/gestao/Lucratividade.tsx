import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  PieChart,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Lucratividade",
    descricao: "No menu lateral, clique em 'Lucratividade' ou navegue pela rota /lucratividade. O dashboard financeiro é carregado com indicadores de performance da frota.",
    icone: <TrendingUp className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo os KPIs",
    descricao: "O topo da página exibe os principais indicadores: receita total, despesas totais, lucro líquido (receitas - despesas) e margem percentual. Cada card tem cor específica para facilitar a leitura.",
    icone: <BarChart3 className="w-5 h-5" />,
  },
  {
    titulo: "Analisando por veículo",
    descricao: "Abaixo dos KPIs gerais, uma tabela mostra a lucratividade individual de cada veículo. Identifique rapidamente quais unidades estão gerando mais retorno e quais precisam de atenção.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Filtrando por período",
    descricao: "Use o seletor de período para analisar dados mensais, trimestrais ou anuais. Compare períodos para identificar tendências de crescimento ou sazonalidade.",
    icone: <Filter className="w-5 h-5" />,
  },
  {
    titulo: "Interpretando gráficos",
    descricao: "Os gráficos de barra mostram a evolução de receitas e despesas ao longo do tempo. O gráfico de pizza exibe a distribuição dos custos por categoria.",
    icone: <PieChart className="w-5 h-5" />,
  },
  {
    titulo: "Exportando relatórios",
    descricao: "Utilize a opção de exportar para gerar relatórios em PDF ou planilha com os dados de lucratividade. Ideal para reuniões e prestação de contas.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Tomando decisões",
    descricao: "Com base nos dados de lucratividade, decida quais veículos manter, quais vender e onde ajustar diárias para maximizar o retorno da frota.",
    icone: <TrendingUp className="w-5 h-5" />,
  },
];

const dicas = [
  "Acompanhe a lucratividade mensalmente para identificar tendências sazonais do mercado.",
  "Veículos com margem negativa por mais de 3 meses devem ser avaliados para venda.",
  "Compare a lucratividade entre veículos similares para precificar diárias corretamente.",
  "Despesas de manutenção impactam diretamente a lucratividade — invista em preventivas.",
  "Use os relatórios exportados para embasar decisões estratégicas da locadora.",
];

const AjudaLucratividade = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Lucratividade</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Lucratividade
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Dashboard financeiro completo com KPIs de receitas, despesas e lucro por veículo. Dados estratégicos para decisões inteligentes sobre sua frota.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Visão Geral
          </h2>
          <div className="neu p-6 bg-card border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              O módulo de Lucratividade transforma dados financeiros brutos em insights acionáveis. Receitas de aluguéis, despesas de manutenção, custos operacionais e seguros são consolidados para mostrar exatamente quanto cada veículo está gerando de retorno.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Receita Total", cor: "bg-success/10 text-success" },
                { label: "Despesas", cor: "bg-destructive/10 text-destructive" },
                { label: "Lucro Líquido", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Margem", cor: "bg-yellow/10 text-yellow" },
              ].map((item) => (
                <div key={item.label} className={`${item.cor} rounded-xl px-4 py-3 text-center`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            Passo a Passo
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="neu p-5 bg-card border flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 grid place-items-center text-blue-600 shrink-0 mt-0.5">
                  {step.icone}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Passo {index + 1}</span>
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

export default AjudaLucratividade;
