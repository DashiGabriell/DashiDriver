import {
  PlusCircle,
  Camera,
  FileText,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Image,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando o formulário",
    descricao: "No bottom nav, clique no botão central 'Anunciar' ou navegue para /marketplace/sell. O formulário de cadastro será aberto.",
    icone: <PlusCircle className="w-5 h-5" />,
  },
  {
    titulo: "Informações do veículo",
    descricao: "Preencha modelo, marca, ano fabricação, ano modelo, quilometragem, combustível, cor, placa e opcionais. Quanto mais completo, melhor.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Adicionando fotos",
    descricao: "Faça upload de fotos de vários ângulos. Fotos de qualidade aumentam significativamente o interesse de compradores.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Definindo preço",
    descricao: "Informe o preço de venda. Consulte veículos similares para definir um valor competitivo.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Localização",
    descricao: "Informe a cidade e estado onde o veículo está disponível. Use o autocomplete para buscar rapidamente.",
    icone: <MapPin className="w-5 h-5" />,
  },
  {
    titulo: "Publicando o anúncio",
    descricao: "Revise as informações e clique em 'Publicar'. O anúncio será aprovado e aparecerá no marketplace.",
    icone: <Save className="w-5 h-5" />,
  },
];

const dicas = [
  "Fotos com boa iluminação e ângulos variados valorizam o anúncio e atraem mais compradores.",
  "Preencha todos os campos — anúncios completos geram mais confiança.",
  "Pesquise preços de veículos similares para definir um valor competitivo.",
  "Descreva opcionais, histórico de manutenção e diferenciais do veículo.",
  "Revise cuidadosamente antes de publicar para evitar erros.",
];

const AjudaAnunciar = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Anunciar Veículo</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-cyan-500" />
          Anunciar Veículo
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Publique seu veículo para venda no Marketplace. Cadastre fotos, informações e preço de forma simples e rápida.
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
              O formulário de anúncio guia você por todas as etapas para publicar um veículo no marketplace. Informações completas e fotos de qualidade são essenciais para atrair compradores.
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

export default AjudaAnunciar;
