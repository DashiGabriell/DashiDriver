import {
  CreditCard,
  Plus,
  Search,
  Edit3,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Financiamento & Seguro",
    descricao: "No menu lateral, clique em 'Financiamento & Seguro' ou navegue pela rota /financiamento-seguro. A tela exibe todas as parcelas recorrentes cadastradas.",
    icone: <CreditCard className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando parcelas",
    descricao: "Cada parcela mostra veículo vinculado, descrição do contrato, valor, data de vencimento e status. As parcelas podem ser de financiamento ou seguro.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Cadastrando novo financiamento",
    descricao: "Clique em 'Nova Parcela' para registrar. Selecione o tipo (Financiamento ou Seguro), o veículo, descreva o contrato, informe o valor, a data de vencimento e a periodicidade.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Editando parcelas",
    descricao: "Clique no ícone de editar para alterar valores, datas ou observações de uma parcela. Útil quando há renegociação de contrato ou correção de valores.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Controlando vencimentos",
    descricao: "Acompanhe o status de cada parcela: pendente, paga ou atrasada. O sistema destaca as parcelas próximas do vencimento para você se programar.",
    icone: <Calendar className="w-5 h-5" />,
  },
  {
    titulo: "Registrando pagamento",
    descricao: "Ao quitar uma parcela, atualize o status para 'Pago' informando a data. O histórico de pagamentos fica registrado para consulta futura.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Vinculando apólices de seguro",
    descricao: "No cadastro de seguro, informe a seguradora, número da apólice, período de vigência e coberturas. O sistema alerta quando a apólice estiver próxima do vencimento.",
    icone: <ShieldCheck className="w-5 h-5" />,
  },
];

const dicas = [
  "Cadastre todas as parcelas assim que contratar o financiamento ou seguro para não perder prazos.",
  "Mantenha as apólices de seguro sempre atualizadas para evitar problemas com veículos descobertos.",
  "Use as observações para registrar contato da seguradora ou condições específicas do contrato.",
  "Configure lembretes para os vencimentos mais importantes.",
  "Consulte o histórico de pagamentos antes de renovar contratos.",
];

const AjudaFinanciamentoSeguro = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Financiamento & Seguro</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-600" />
          Financiamento & Seguro
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Acompanhe parcelas recorrentes de financiamentos e seguros veiculares sem nunca perder um vencimento. Mantenha o controle financeiro dos contratos da sua frota.
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
              O módulo de Financiamento & Seguro permite cadastrar e acompanhar todas as parcelas recorrentes da frota, sejam de financiamentos bancários ou apólices de seguro. Cada parcela é vinculada a um veículo e possui controle de status individual.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Financiamento", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Seguro", cor: "bg-success/10 text-success" },
                { label: "Pendente", cor: "bg-yellow/10 text-yellow" },
                { label: "Pago", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Atrasado", cor: "bg-destructive/10 text-destructive" },
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

export default AjudaFinanciamentoSeguro;
