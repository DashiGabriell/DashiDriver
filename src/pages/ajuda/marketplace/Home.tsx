import {
  LayoutDashboard,
  Search,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando o Marketplace",
    descricao: "No menu principal, clique em 'Marketplace' ou navegue para /marketplace/home. A vitrine principal será exibida com banner, categorias e veículos em destaque.",
    icone: <ShoppingBag className="w-5 h-5" />,
  },
  {
    titulo: "Navegando pelas categorias",
    descricao: "Role horizontalmente pelas categorias (SUV, Sedan, Hatch, Picape, etc.) e clique em uma para filtrar os veículos.",
    icone: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    titulo: "Explorando veículos em destaque",
    descricao: "A seção 'Destaques' mostra veículos em evidência. Clique em um card para ver detalhes completos do anúncio.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Usando a busca rápida",
    descricao: "No topo da página, use o campo de busca para pesquisar por modelo, marca ou cidade. O autocomplete ajuda a encontrar resultados mais rápido.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Acessando outras seções",
    descricao: "Use o menu inferior (bottom nav) para navegar entre Início, Buscar, Anunciar, Favoritos e Perfil.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "A vitrine inicial é personalizada com base na sua localização e histórico de buscas.",
  "Veículos em destaque têm prioridade na vitrine — são anúncios com planos premium.",
  "Use a busca rápida para encontrar veículos específicos sem precisar navegar pelas categorias.",
  "Explore diferentes categorias para descobrir veículos que talvez não estejam nos destaques.",
  "O marketplace é mobile-first — a experiência é otimizada tanto no celular quanto no desktop.",
];

const AjudaHome = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Início</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-cyan-500" />
          Início
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          A vitrine principal do Marketplace com banner, categorias e veículos em destaque para você explorar.
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
              A página Início é a porta de entrada do Marketplace. Aqui você encontra um banner promocional, categorias de veículos para navegação rápida e uma seleção de veículos em destaque.
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

export default AjudaHome;
