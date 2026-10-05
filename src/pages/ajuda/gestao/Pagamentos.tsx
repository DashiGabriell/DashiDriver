import {
  Wallet,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Receipt,
  Calendar,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Pagamentos",
    descricao: "No menu lateral, clique em 'Recebimentos' ou navegue pela rota /pagamentos. A tela exibe todas as transações financeiras da frota organizadas por data.",
    icone: <Wallet className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo a listagem",
    descricao: "Cada transação mostra descrição, veículo vinculado, valor, data de vencimento e status. As cores indicam se é uma receita (entrada) ou despesa (saída).",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Filtrando transações",
    descricao: "Use os filtros para visualizar por período, status (pendente, pago, atrasado, cancelado), tipo (receita/despesa) ou veículo específico. Ideal para conciliação financeira.",
    icone: <Filter className="w-5 h-5" />,
  },
  {
    titulo: "Registrando novo pagamento",
    descricao: "Clique em 'Novo Pagamento' para registrar. Informe o tipo (receita ou despesa), veículo, descrição, valor, data de vencimento e forma de pagamento. Anexe comprovantes se necessário.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Anexando comprovantes",
    descricao: "Ao registrar ou editar um pagamento, é possível anexar fotos ou PDFs do comprovante. Isso mantém um registro fiscal organizado e auditável.",
    icone: <Receipt className="w-5 h-5" />,
  },
  {
    titulo: "Baixando pagamentos",
    descricao: "Ao receber ou pagar, atualize o status para 'Pago' informando a data do pagamento. O sistema registra automaticamente o histórico da transação.",
    icone: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando atrasados",
    descricao: "A seção de alertas destaca pagamentos em atraso. Use o filtro 'Atrasado' para visualizar rapidamente o que precisa de atenção e evitar juros.",
    icone: <Calendar className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha todos os comprovantes anexados para facilitar a prestação de contas.",
  "Use a categoria correta para cada transação — isso ajuda na análise de lucratividade.",
  "Configure alertas de vencimento para não perder prazos importantes.",
  "Registre receitas e despesas no mesmo dia da ocorrência para um fluxo de caixa preciso.",
  "O filtro por veículo ajuda a identificar quais unidades estão gerando mais retorno.",
];

const AjudaPagamentos = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Pagamentos</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-blue-600" />
          Pagamentos
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          O módulo de Pagamentos centraliza o controle financeiro da frota com contas a pagar e receber, status de cada transação e comprovantes anexados.
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
              A página de Pagamentos permite registrar e acompanhar todas as movimentações financeiras da frota. Cada transação é categorizada como receita ou despesa, vinculada a um veículo e pode ter comprovantes anexados para consulta futura.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Receitas", cor: "bg-success/10 text-success" },
                { label: "Despesas", cor: "bg-destructive/10 text-destructive" },
                { label: "Pendente", cor: "bg-yellow/10 text-yellow" },
                { label: "Pago", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Atrasado", cor: "bg-red-500/10 text-red-500" },
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

export default AjudaPagamentos;
