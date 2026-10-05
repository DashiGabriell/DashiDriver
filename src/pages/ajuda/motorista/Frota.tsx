import {
  Truck,
  Search,
  Users,
  Car,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Frota",
    descricao: "No bottom nav, toque em 'Frota' ou navegue para /mobile/frota. A página exibe abas para Veículos e Motoristas.",
    icone: <Truck className="w-5 h-5" />,
  },
  {
    titulo: "Alternando entre abas",
    descricao: "Toque em 'Veículos' ou 'Motoristas' para alternar a visualização. A aba ativa é destacada com animação.",
    icone: <Layers className="w-5 h-5" />,
  },
  {
    titulo: "Buscando na frota",
    descricao: "Use o campo de busca para filtrar veículos por placa, modelo ou motorista. A busca é feita em tempo real.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando cards",
    descricao: "Cada card exibe informações resumidas: foto, nome/modelo, status e score. Cards com problemas são destacados.",
    icone: <Car className="w-5 h-5" />,
  },
  {
    titulo: "Acessando detalhes",
    descricao: "Toque em um card para abrir o BottomSheet com ações rápidas: ligar, WhatsApp, ver histórico completo e editar.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Use a busca para localizar rapidamente um veículo ou motorista específico.",
  "O score do motorista ajuda a identificar quem está com problemas.",
  "Cards com status vermelho indicam atenção imediata.",
  "O BottomSheet oferece ações rápidas sem sair da página.",
  "Mantenha os dados dos veículos sempre atualizados.",
];

const AjudaFrota = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Frota</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Truck className="w-8 h-8 text-cyan-500" />
          Frota
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie veículos e motoristas em um só lugar com busca, cards informativos e ações rápidas.
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
              A página Frota unifica a gestão de veículos e motoristas em abas alternáveis. Cada item é exibido em um card com informações resumidas e acesso rápido a ações e detalhes.
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

export default AjudaFrota;
