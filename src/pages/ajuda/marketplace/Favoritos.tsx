import {
  Heart,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Favoritos",
    descricao: "No bottom nav, clique no ícone de coração (Favoritos) ou navegue para /marketplace/wishlist.",
    icone: <Heart className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando itens salvos",
    descricao: "A lista exibe todos os veículos que você salvou como favorito, com foto, modelo, preço e localização.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Adicionando aos favoritos",
    descricao: "Na página de detalhes de qualquer veículo, clique no ícone de coração para adicionar ou remover dos favoritos.",
    icone: <Heart className="w-5 h-5" />,
  },
  {
    titulo: "Removendo itens",
    descricao: "Na lista de favoritos, clique no ícone de lixeira ou no coração preenchido para remover um veículo da lista.",
    icone: <Trash2 className="w-5 h-5" />,
  },
  {
    titulo: "Acessando o anúncio",
    descricao: "Clique em qualquer card da lista para ver os detalhes completos do veículo favoritado.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Use os favoritos para comparar veículos antes de decidir a compra.",
  "Veículos favoritados recebem notificações se o preço for alterado.",
  "Remova veículos vendidos ou que não interessam mais para manter a lista organizada.",
  "A lista de favoritos é pessoal e visível apenas para você.",
  "Compartilhe veículos favoritos com amigos usando o botão de compartilhar no detalhe.",
];

const AjudaFavoritos = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Favoritos</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-cyan-500" />
          Favoritos
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Salve e gerencie seus veículos favoritos para acompanhar oportunidades e comparar anúncios.
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
              A lista de favoritos permite salvar veículos que despertaram seu interesse para acessar rapidamente depois e comparar antes de tomar uma decisão.
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

export default AjudaFavoritos;
