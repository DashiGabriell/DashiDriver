import {
  Wrench,
  Plus,
  Car,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  FileText,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Manutenção",
    descricao: "No aplicativo mobile, navegue para /mobile/manutencao. O histórico de manutenções da frota será exibido.",
    icone: <Wrench className="w-5 h-5" />,
  },
  {
    titulo: "Registrando nova manutenção",
    descricao: "Toque no botão '+' para registrar uma nova manutenção. Informe veículo, tipo de serviço, data e valor.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Tipos de manutenção",
    descricao: "Registre diferentes tipos: preventiva, corretiva, revisão programada, troca de pneus, funilaria, elétrica e mais.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Histórico por veículo",
    descricao: "Cada veículo possui um histórico completo de manutenções. Acompanhe gastos e frequência para planejar preventivas.",
    icone: <Car className="w-5 h-5" />,
  },
  {
    titulo: "Notificações preventivas",
    descricao: "O sistema envia alertas quando um veículo está próximo da data de revisão programada, ajudando a evitar quebras.",
    icone: <Calendar className="w-5 h-5" />,
  },
];

const dicas = [
  "Registre toda manutenção imediatamente após a realização do serviço.",
  "Manutenções preventivas regulares reduzem custos com reparos emergenciais.",
  "Acompanhe os gastos por veículo para identificar quais exigem mais manutenção.",
  "Use as notificações para não perder as revisões programadas.",
  "Mantenha notas fiscais dos serviços para comprovação e garantia.",
];

const AjudaManutencao = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Manutenção</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Wrench className="w-8 h-8 text-cyan-500" />
          Manutenção
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Registre e acompanhe manutenções da frota com histórico completo, notificações preventivas e controle de gastos.
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
              O módulo de Manutenção permite registrar e acompanhar todos os serviços realizados na frota. Com notificações preventivas e histórico por veículo, você mantém a frota sempre em dia.
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

export default AjudaManutencao;
