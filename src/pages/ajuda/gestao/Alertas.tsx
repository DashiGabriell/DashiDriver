import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Filter,
  Info,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Alertas",
    descricao: "No menu lateral, clique em 'Alertas' ou navegue pela rota /alertas. A central de notificações exibe todos os avisos importantes do sistema.",
    icone: <Bell className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo as categorias",
    descricao: "Os alertas são divididos em duas categorias: Críticos (vermelho) para vencimentos e irregularidades urgentes, e Operacionais (azul) para notificações do dia a dia.",
    icone: <Info className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando detalhes",
    descricao: "Clique em um alerta para expandir e ver detalhes completos: veículo ou motorista envolvido, data do evento e ações recomendadas para resolver.",
    icone: <BellRing className="w-5 h-5" />,
  },
  {
    titulo: "Marcando como lido",
    descricao: "Após visualizar um alerta, clique em 'Marcar como Lido' para removê-lo da lista de não lidos. Isso ajuda a manter o foco nos avisos pendentes.",
    icone: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    titulo: "Limpando alertas",
    descricao: "Use o botão 'Limpar Tudo' para marcar todos os alertas como lidos de uma vez. Ideal após uma sessão de revisão de notificações.",
    icone: <Trash2 className="w-5 h-5" />,
  },
  {
    titulo: "Filtrando alertas",
    descricao: "Use os filtros para visualizar apenas alertas críticos, operacionais, não lidos ou por veículo específico. Facilita a priorização das ações.",
    icone: <Filter className="w-5 h-5" />,
  },
];

const tiposAlerta = [
  "Manutenção programada vencendo",
  "CNH de motorista próxima do vencimento",
  "Documento de veículo expirando",
  "Pagamento em atraso",
  "Seguro com vencimento próximo",
  "Revisão de quilometragem atingida",
];

const dicas = [
  "Configure os alertas de vencimento com antecedência mínima de 7 dias para ter tempo de agir.",
  "Priorize sempre os alertas críticos — eles indicam situações que podem gerar multas ou prejuízos.",
  "Revise os alertas pelo menos uma vez ao dia para não perder prazos importantes.",
  "Alertas de manutenção preventiva ajudam a evitar falhas mecânicas inesperadas.",
  "Mantenha os dados de contato dos motoristas atualizados para alertas automáticos.",
];

const AjudaAlertas = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Alertas</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Alertas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Central de notificações do sistema com alertas críticos e operacionais. Mantenha-se informado sobre vencimentos, manutenções e pendências importantes.
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
              A Central de Alertas consolida todas as notificações importantes do sistema em um só lugar. Alertas críticos exigem ação imediata, enquanto os operacionais informam sobre eventos rotineiros. O sistema gera alertas automaticamente com base nos dados cadastrados.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Crítico", cor: "bg-destructive/10 text-destructive" },
                { label: "Operacional", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Não Lido", cor: "bg-yellow/10 text-yellow" },
                { label: "Resolvido", cor: "bg-success/10 text-success" },
              ].map((item) => (
                <div key={item.label} className={`${item.cor} rounded-xl px-4 py-3`}>
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
            Tipos de Alerta
          </h2>
          <div className="neu p-6 bg-card border">
            <ul className="space-y-3">
              {tiposAlerta.map((tipo, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                  {tipo}
                </li>
              ))}
            </ul>
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
