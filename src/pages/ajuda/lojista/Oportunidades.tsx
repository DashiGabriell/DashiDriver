import {
  Target,
  Search,
  Filter,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Calendar,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Oportunidades",
    descricao: "No menu do lojista, clique em 'Oportunidades' ou navegue pela rota /lojista/oportunidades. A tela exibe leads de locadoras interessadas em veículos.",
    icone: <Target className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando as oportunidades",
    descricao: "Cada card de oportunidade mostra locadora, cidade, estado, modelo desejado, quantidade de veículos e orçamento disponível.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Usando os filtros",
    descricao: "Filtre por estado, cidade, modelo, faixa de preço, quantidade e data. Os filtros ajudam a encontrar rapidamente as melhores oportunidades para seu estoque.",
    icone: <Filter className="w-5 h-5" />,
  },
  {
    titulo: "Analisando detalhes",
    descricao: "Clique em uma oportunidade para ver detalhes completos: especificações da demanda, prazo de resposta e informações de contato da locadora.",
    icone: <MessageCircle className="w-5 h-5" />,
  },
  {
    titulo: "Manifestando interesse",
    descricao: "Ao encontrar uma oportunidade compatível, manifeste interesse. A locadora será notificada e poderá entrar em contato para negociar.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Ative os filtros de localização para encontrar oportunidades próximas ao seu estoque.",
  "Oportunidades recentes têm maior chance de conversão — priorize as mais novas.",
  "Mantenha seu estoque diversificado para atender mais perfis de demanda.",
  "Responda rapidamente às oportunidades para se destacar da concorrência.",
  "Acompanhe o histórico de oportunidades que você já respondeu.",
];

const AjudaOportunidades = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Oportunidades</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Target className="w-8 h-8 text-cyan-500" />
          Oportunidades
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Encontre leads e oportunidades de negócio com filtros avançados. Conecte seu estoque à demanda certa.
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
              O módulo de Oportunidades conecta locadoras que precisam de veículos com lojistas que têm estoque disponível. Cada oportunidade representa uma demanda real com orçamento definido.
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

export default AjudaOportunidades;
