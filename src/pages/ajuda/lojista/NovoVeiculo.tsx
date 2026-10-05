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
    titulo: "Acessando o cadastro",
    descricao: "Na página 'Meu Estoque', clique em 'Adicionar Veículo' ou navegue diretamente por /lojista/estoque/novo. O formulário de cadastro será aberto.",
    icone: <PlusCircle className="w-5 h-5" />,
  },
  {
    titulo: "Informações básicas",
    descricao: "Preencha os dados do veículo: modelo, marca, ano de fabricação, ano modelo, quilometragem, combustível, cor e placa. Todos os campos são importantes para a busca.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Adicionando fotos",
    descricao: "Faça upload de fotos do veículo. Tire fotos de vários ângulos: frente, lateral, interior, painel, bancos, porta-malas e detalhes. Fotos de qualidade aumentam o interesse.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Definindo preço",
    descricao: "Informe o preço de venda e as condições de pagamento. O sistema pode sugerir um preço com base em veículos similares do marketplace.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Localização e contato",
    descricao: "Informe a cidade e estado onde o veículo está disponível para venda. O contato do lojista já está vinculado ao seu perfil.",
    icone: <MapPin className="w-5 h-5" />,
  },
  {
    titulo: "Publicando o anúncio",
    descricao: "Revise todas as informações e clique em 'Salvar' ou 'Publicar'. O veículo aparecerá no marketplace imediatamente se estiver com status 'Disponível'.",
    icone: <Save className="w-5 h-5" />,
  },
];

const dicas = [
  "Fotos com boa iluminação e fundo neutro valorizam o veículo e atraem mais compradores.",
  "Preencha todos os campos do formulário — anúncios completos têm mais chances de venda.",
  "Pesquise preços de veículos similares antes de definir o valor do seu anúncio.",
  "Adicione informações sobre opcionais, histórico de manutenção e garantia.",
  "Revise as fotos e dados antes de publicar para evitar retrabalho.",
];

const AjudaNovoVeiculo = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Novo Veículo</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-cyan-500" />
          Novo Veículo
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Cadastre um novo veículo no estoque com fotos, informações técnicas e preço para publicar no marketplace.
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
              O formulário de Novo Veículo guia você por todas as etapas necessárias para cadastrar um veículo no marketplace. Informações completas e fotos de qualidade são essenciais para atrair compradores.
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

export default AjudaNovoVeiculo;
