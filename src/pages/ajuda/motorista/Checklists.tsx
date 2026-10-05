import {
  ClipboardCheck,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Image,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Checklists",
    descricao: "No bottom nav, toque em 'Checklists' ou navegue para /mobile/checklists. A lista de vistorias será exibida.",
    icone: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    titulo: "Criando nova vistoria",
    descricao: "Toque no botão flutuante '+' para iniciar uma nova vistoria. Escolha entre check-in ou check-out.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Preenchendo itens",
    descricao: "Percorra a lista de itens a verificar: lataria, pneus, vidros, luzes, interior, documentos. Marque cada item como OK ou com observação.",
    icone: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    titulo: "Adicionando fotos",
    descricao: "Tire fotos de cada item vistoriado. As imagens ficam anexadas ao laudo e servem como comprovante do estado do veículo.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Finalizando e compartilhando",
    descricao: "Após preencher tudo, finalize a vistoria. O laudo em PDF é gerado automaticamente. Compartilhe via WhatsApp com o motorista.",
    icone: <Share2 className="w-5 h-5" />,
  },
  {
    titulo: "Comparando vistorias",
    descricao: "No detalhe de uma vistoria, use a opção 'Comparar' para ver as diferenças entre check-in e check-out lado a lado.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Sempre tire fotos em local bem iluminado para registros de qualidade.",
  "Finalize a vistoria imediatamente após a entrega do veículo.",
  "O PDF gerado serve como comprovante oficial para ambas as partes.",
  "Use a comparação check-in/check-out para identificar danos ocorridos durante a locação.",
  "Compartilhe o laudo com o motorista para transparência total.",
];

const AjudaChecklists = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Checklists</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-cyan-500" />
          Checklists
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Realize vistorias de check-in e check-out com fotos, gere PDF profissional e compartilhe com o motorista.
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
              O módulo de Checklists permite realizar vistorias completas com checklist de itens, fotos e geração automática de PDF. Ideal para registrar o estado do veículo antes e depois de cada locação.
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

export default AjudaChecklists;
