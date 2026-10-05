import {
  Package,
  Eye,
  Edit3,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ToggleLeft,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Meus Anúncios",
    descricao: "No menu do marketplace, acesse 'Meus Anúncios' ou navegue para /marketplace/my-ads. A lista de todos os seus anúncios será exibida.",
    icone: <Package className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando a listagem",
    descricao: "A tabela mostra modelo, ano, preço, visualizações, status e data de publicação de cada anúncio.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Gerenciando status",
    descricao: "Ative ou desative anúncios com o toggle. Anúncios ativos aparecem nas buscas; inativos ficam ocultos mas mantêm os dados.",
    icone: <ToggleLeft className="w-5 h-5" />,
  },
  {
    titulo: "Editando anúncios",
    descricao: "Clique em 'Editar' para alterar fotos, preço, descrição ou qualquer informação do anúncio.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando leads",
    descricao: "Veja quantos leads cada anúncio gerou. Clique para ver os detalhes dos compradores interessados.",
    icone: <BarChart3 className="w-5 h-5" />,
  },
  {
    titulo: "Criando novo anúncio",
    descricao: "Clique em 'Anunciar Veículo' para cadastrar um novo item diretamente da página de meus anúncios.",
    icone: <Plus className="w-5 h-5" />,
  },
];

const dicas = [
  "Anúncios com fotos de qualidade e descrição completa geram mais leads.",
  "Desative anúncios de veículos vendidos para não receber contatos indevidos.",
  "Acompanhe as visualizações para saber quais anúncios têm melhor desempenho.",
  "Edite o preço se o anúncio tiver muitas visualizações mas poucos leads.",
  "Renove anúncios antigos para dar visibilidade novamente.",
];

const AjudaMeusAnuncios = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Meus Anúncios</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Package className="w-8 h-8 text-cyan-500" />
          Meus Anúncios
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie todos os seus anúncios ativos e inativos, edite informações e acompanhe leads gerados.
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
              Meus Anúncios é o centro de controle de todos os veículos que você publicou no marketplace. Aqui você ativa/desativa, edita e acompanha o desempenho de cada anúncio.
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

export default AjudaMeusAnuncios;
