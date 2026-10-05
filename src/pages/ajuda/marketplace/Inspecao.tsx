import {
  ClipboardCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Shield,
  Star,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando a Inspeção",
    descricao: "Na página de detalhes de um veículo, clique em 'Solicitar Inspeção' ou navegue para /marketplace/inspection/:listingId.",
    icone: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    titulo: "Iniciando a vistoria",
    descricao: "O formulário de inspeção é aberto com os dados do veículo pré-preenchidos. Confira as informações básicas.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Preenchendo itens verificados",
    descricao: "Percorra a lista de itens a serem verificados: motor, câmbio, suspensão, freios, elétrica, carroceria, pneus, interior e documentação. Marque cada item como OK ou com observações.",
    icone: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    titulo: "Adicionando fotos",
    descricao: "Tire fotos de cada item inspecionado para documentar o estado do veículo. As fotos ficam anexadas ao laudo.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Finalizando a inspeção",
    descricao: "Revise todos os itens e clique em 'Finalizar'. O laudo de inspeção é gerado e fica disponível para consulta.",
    icone: <Shield className="w-5 h-5" />,
  },
];

const dicas = [
  "Realize a inspeção em local bem iluminado para fotos de qualidade.",
  "Seja criterioso na avaliação de cada item — um laudo preciso gera confiança.",
  "Adicione observações detalhadas para itens com desgaste ou avarias.",
  "Tire fotos de todos os ângulos relevantes de cada item inspecionado.",
  "O laudo de inspeção pode ser usado como garantia para o comprador.",
];

const AjudaInspecao = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Inspeção</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-cyan-500" />
          Inspeção
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Realize inspeções veiculares detalhadas com checklist completo, fotos e laudo final.
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
              A inspeção veicular permite avaliar detalhadamente o estado do veículo, item por item, com fotos e observações. O laudo gerado serve como documentação oficial da condição do veículo.
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

export default AjudaInspecao;
