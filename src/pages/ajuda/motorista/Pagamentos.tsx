import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Calendar,
  FileText,
  TrendingDown,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Pagamentos",
    descricao: "No bottom nav, acesse a seção de pagamentos ou navegue para /mobile/pagamentos. O histórico de pagamentos será exibido.",
    icone: <Wallet className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando o histórico",
    descricao: "A lista exibe todos os pagamentos com data, valor, motorista e status. Use os filtros para refinar a busca.",
    icone: <Calendar className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo os status",
    descricao: "Cada pagamento possui um status: Pago (verde), Pendente (amarelo) ou Atrasado (vermelho). Fique atento aos vencimentos.",
    icone: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    titulo: "Detalhes do pagamento",
    descricao: "Toque em um pagamento para ver detalhes: comprovante, data de vencimento, valor e forma de pagamento.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando atrasados",
    descricao: "A seção de valores atrasados no início ajuda a identificar rapidamente quais motoristas estão com pendências financeiras.",
    icone: <TrendingDown className="w-5 h-5" />,
  },
];

const dicas = [
  "Acompanhe os pagamentos semanalmente para evitar acúmulo de atrasados.",
  "Use os filtros de período para análises mensais.",
  "Pagamentos atrasados geram alertas automáticos para o motorista.",
  "Mantenha os comprovantes organizados para a contabilidade.",
  "Configure lembretes de vencimento nas configurações do app.",
];

const AjudaPagamentos = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Pagamentos</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-cyan-500" />
          Pagamentos
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Acompanhe pagamentos de motoristas com histórico completo, filtros e status atualizados em tempo real.
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
              O módulo de Pagamentos centraliza o histórico financeiro dos motoristas. Acompanhe valores recebidos, pendentes e atrasados com filtros por período.
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

export default AjudaPagamentos;
