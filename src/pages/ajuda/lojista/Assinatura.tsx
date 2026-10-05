import {
  CreditCard,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  HelpCircle,
  Crown,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Assinatura",
    descricao: "No menu do lojista, clique em 'Assinatura' ou navegue pela rota /lojista/assinatura. A página exibe seu plano atual e opções disponíveis.",
    icone: <CreditCard className="w-5 h-5" />,
  },
  {
    titulo: "Conhecendo os planos",
    descricao: "Compare os planos disponíveis: cada um oferece diferentes limites de veículos no estoque, funcionalidades e benefícios exclusivos.",
    icone: <Crown className="w-5 h-5" />,
  },
  {
    titulo: "Seu plano atual",
    descricao: "Veja os detalhes do seu plano vigente: data de vencimento, forma de pagamento, limite de veículos e recursos disponíveis.",
    icone: <Package className="w-5 h-5" />,
  },
  {
    titulo: "Fazendo upgrade",
    descricao: "Para mudar de plano, clique em 'Fazer Upgrade' ou 'Alterar Plano'. A diferença será calculada proporcionalmente aos dias restantes do ciclo.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
  {
    titulo: "Histórico de pagamentos",
    descricao: "Acesse o histórico de pagamentos para ver faturas anteriores, status de cada cobrança e comprovantes.",
    icone: <HelpCircle className="w-5 h-5" />,
  },
];

const dicas = [
  "Escolha um plano com limite de veículos compatível com seu estoque atual e crescimento esperado.",
  "Verifique a data de vencimento para evitar a suspensão do seu plano.",
  "Ao fazer upgrade, o valor é calculado proporcionalmente — você paga apenas a diferença.",
  "Faturas podem ser baixadas no histórico de pagamentos para sua contabilidade.",
  "Planos superiores oferecem maior visibilidade nos resultados de busca do marketplace.",
];

const AjudaAssinatura = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Assinatura</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-cyan-500" />
          Assinatura
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie seu plano de assinatura, veja detalhes do plano atual e faça upgrade para acessar mais recursos.
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
              O módulo de Assinatura centraliza a gestão do seu plano contratado. Você pode visualizar detalhes, comparar planos e fazer upgrade ou downgrade conforme a necessidade do seu negócio.
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

export default AjudaAssinatura;
