import {
  ListChecks,
  Eye,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Search,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando a Lista de Inspeções",
    descricao: "No menu do marketplace, acesse 'Inspeções' ou navegue para /marketplace/inspections/:listingId. A lista de inspeções do veículo será exibida.",
    icone: <ListChecks className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando inspeções",
    descricao: "A lista exibe todas as inspeções realizadas para um veículo, com data, responsável e status (pendente, concluída, aprovada).",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Filtrando inspeções",
    descricao: "Use os filtros para encontrar inspeções por data, status ou responsável. A busca facilita localizar inspeções específicas.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando laudos",
    descricao: "Clique em uma inspeção concluída para ver o laudo completo com todos os itens verificados e fotos.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando cronograma",
    descricao: "Veja o histórico cronológico de inspeções para acompanhar a evolução do estado do veículo ao longo do tempo.",
    icone: <Calendar className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha um histórico de inspeções para comprovar a procedência do veículo.",
  "Inspeções recentes geram mais confiança em compradores potenciais.",
  "Compartilhe laudos de inspeção com compradores interessados para agilizar a venda.",
  "Agende inspeções periódicas para veículos de alto valor.",
  "Use os filtros para localizar rapidamente inspeções antigas quando necessário.",
];

const AjudaListaInspecoes = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Lista de Inspeções</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-cyan-500" />
          Lista de Inspeções
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Acompanhe todas as inspeções realizadas em seus veículos com histórico completo e acesso aos laudos.
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
              A Lista de Inspeções reúne o histórico completo de todas as vistorias realizadas em um veículo. Cada inspeção registra data, responsável, itens verificados, fotos e o laudo final.
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

export default AjudaListaInspecoes;
