import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Car,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando a Busca",
    descricao: "No bottom nav, clique em 'Buscar' ou navegue para /marketplace/search. O campo de busca com autocomplete será exibido.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Pesquisando por texto",
    descricao: "Digite modelo, marca ou palavra-chave. O autocomplete sugere resultados conforme você digita, agilizando a busca.",
    icone: <Car className="w-5 h-5" />,
  },
  {
    titulo: "Filtrando por cidade",
    descricao: "Use o campo de cidade para encontrar veículos disponíveis em uma localização específica. O autocomplete de cidades facilita a seleção.",
    icone: <MapPin className="w-5 h-5" />,
  },
  {
    titulo: "Usando filtros avançados",
    descricao: "Clique no ícone de filtros para refinar por faixa de preço, ano, quilometragem, combustível, cor e categoria.",
    icone: <Filter className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando resultados",
    descricao: "Os resultados aparecem em grade com cards contendo foto, modelo, ano, preço e localização. Clique em um card para ver detalhes.",
    icone: <SlidersHorizontal className="w-5 h-5" />,
  },
  {
    titulo: "Ordenando resultados",
    descricao: "Use o seletor de ordenação para organizar por menor preço, maior preço, ano mais recente ou quilometragem.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Use termos específicos na busca para encontrar resultados mais precisos.",
  "Combine filtros de cidade e preço para encontrar veículos próximos e dentro do seu orçamento.",
  "O autocomplete de cidades busca por qualquer parte do nome — não precisa digitar o nome completo.",
  "Limpe os filtros rapidamente para recomeçar uma nova busca do zero.",
  "Salve buscas frequentes usando a lista de favoritos para acessar rapidamente depois.",
];

const AjudaBuscar = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Buscar</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-cyan-500" />
          Buscar
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Encontre o veículo ideal com busca inteligente, autocomplete, filtros avançados e ordenação.
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
              A busca do Marketplace combina texto, localização e filtros avançados para encontrar o veículo perfeito. O autocomplete agiliza a pesquisa e os resultados são exibidos em grade com todas as informações essenciais.
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

export default AjudaBuscar;
