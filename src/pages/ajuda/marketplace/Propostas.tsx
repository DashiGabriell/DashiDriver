import {
  MessageCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  User,
  Calendar,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Propostas",
    descricao: "No menu do marketplace, acesse 'Propostas' ou navegue para /marketplace/proposals. A lista de leads recebidos será exibida.",
    icone: <MessageCircle className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando leads",
    descricao: "Cada lead mostra o comprador interessado, veículo, data e status do contato (novo, respondido, concluído).",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Detalhes do lead",
    descricao: "Clique em um lead para ver detalhes completos: nome do comprador, telefone, email e mensagem enviada.",
    icone: <User className="w-5 h-5" />,
  },
  {
    titulo: "Respondendo propostas",
    descricao: "Use o botão 'Responder via WhatsApp' para entrar em contato direto com o comprador interessado.",
    icone: <MessageCircle className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando histórico",
    descricao: "Veja o histórico de interações com cada lead, incluindo data do primeiro contato e status atual.",
    icone: <Calendar className="w-5 h-5" />,
  },
];

const dicas = [
  "Responda leads rapidamente — quanto mais rápido, maior a chance de conversão.",
  "Mantenha um histórico de todas as conversas para referência futura.",
  "Leads não respondidos em 48h têm baixa probabilidade de conversão.",
  "Use mensagens claras e objetivas ao entrar em contato com o comprador.",
  "Marque leads como concluídos após a venda para organizar seu funil.",
];

const AjudaPropostas = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Propostas</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-cyan-500" />
          Propostas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Visualize e responda propostas recebidas nos seus anúncios. Acompanhe leads e converta em vendas.
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
              O módulo de Propostas centraliza todos os leads gerados pelos seus anúncios. Cada proposta representa um comprador interessado que entrou em contato para negociar.
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

export default AjudaPropostas;
