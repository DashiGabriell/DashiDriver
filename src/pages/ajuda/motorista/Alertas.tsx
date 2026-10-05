import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Calendar,
  Wrench,
  DollarSign,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Alertas",
    descricao: "No bottom nav, toque em 'Alertas' ou no sino no cabeçalho da página inicial. A central de notificações será aberta.",
    icone: <Bell className="w-5 h-5" />,
  },
  {
    titulo: "Tipos de alertas",
    descricao: "Os alertas são categorizados: documentos vencendo, manutenção programada, pagamentos atrasados e notificações do sistema.",
    icone: <AlertTriangle className="w-5 h-5" />,
  },
  {
    titulo: "Alertas de documentos",
    descricao: "Receba notificações quando a CNH, CRLV ou outros documentos estiverem próximos do vencimento. Renove antes do prazo.",
    icone: <Shield className="w-5 h-5" />,
  },
  {
    titulo: "Alertas de manutenção",
    descricao: "O sistema notifica quando um veículo está próximo da revisão programada ou quando há manutenções preventivas pendentes.",
    icone: <Wrench className="w-5 h-5" />,
  },
  {
    titulo: "Alertas de pagamento",
    descricao: "Receba alertas de pagamentos pendentes e atrasados para tomar ação rápida e evitar multas ou juros.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Gerenciando notificações",
    descricao: "Toque em um alerta para ver detalhes. Use o botão de ação para resolver ou agendar a pendência.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Configure quais tipos de alerta deseja receber nas configurações do app.",
  "Alertas de documentos ajudam a evitar multas e problemas legais.",
  "Resolva alertas de manutenção preventiva para evitar quebras.",
  "Pagamentos atrasados geram alertas diários até a regularização.",
  "Mantenha os alertas sempre visíveis para não perder prazos importantes.",
];

const AjudaAlertas = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Alertas</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Bell className="w-8 h-8 text-cyan-500" />
          Alertas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Central de notificações com alertas de documentos, manutenção programada e pagamentos.
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
              A central de Alertas reúne todas as notificações importantes do sistema. Receba avisos sobre documentos vencendo, manutenções programadas e pagamentos pendentes para nunca perder prazos.
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

export default AjudaAlertas;
