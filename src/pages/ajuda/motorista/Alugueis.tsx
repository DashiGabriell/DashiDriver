import {
  CalendarCheck,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Aluguéis",
    descricao: "No aplicativo mobile, navegue para /mobile/alugueis. A lista de contratos de aluguel será exibida.",
    icone: <CalendarCheck className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando contratos",
    descricao: "A lista exibe contratos ativos e finalizados com veículo, motorista, valor e data de vencimento.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Detalhes do contrato",
    descricao: "Toque em um contrato para ver informações completas: período, parcelas, valor total e status de pagamento.",
    icone: <Calendar className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando vencimentos",
    descricao: "Os contratos próximos do vencimento são destacados. Receba notificações para renovação ou devolução do veículo.",
    icone: <Clock className="w-5 h-5" />,
  },
  {
    titulo: "Gerenciando parcelas",
    descricao: "Acompanhe o status de cada parcela do contrato: paga, pendente ou atrasada. Toque para ver detalhes do pagamento.",
    icone: <DollarSign className="w-5 h-5" />,
  },
];

const dicas = [
  "Renove contratos antes do vencimento para evitar descontinuidade.",
  "Acompanhe as parcelas pendentes para não acumular dívidas.",
  "Contratos ativos aparecem no resumo financeiro da página inicial.",
  "Use as notificações para não perder prazos de renovação.",
  "Mantenha os dados do veículo atualizados durante o período de aluguel.",
];

const AjudaAlugueis = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Aluguéis</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-cyan-500" />
          Aluguéis
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie contratos de aluguel com histórico completo, controle de parcelas e notificações de vencimento.
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
              O módulo de Aluguéis centraliza todos os contratos de locação de veículos. Acompanhe contratos ativos, histórico de parcelas e receba alertas de vencimento.
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

export default AjudaAlugueis;
