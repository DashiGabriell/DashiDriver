import {
  FileText,
  Eye,
  Image,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Shield,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando os detalhes",
    descricao: "Na vitrine ou nos resultados de busca, clique no card do veículo para abrir a página de detalhes em /marketplace/detail/:id.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Galeria de fotos",
    descricao: "Navegue pela galeria de fotos do veículo. Deslize para ver todos os ângulos: frente, lateral, interior, painel e detalhes.",
    icone: <Image className="w-5 h-5" />,
  },
  {
    titulo: "Informações do veículo",
    descricao: "Abaixo das fotos, confira dados completos: modelo, ano, quilometragem, combustível, cor, placa, opcionais e histórico.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Preço e condições",
    descricao: "Veja o preço anunciado e as condições de pagamento aceitas pelo vendedor.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Localização do vendedor",
    descricao: "Confira a cidade e estado onde o veículo está disponível para venda.",
    icone: <MapPin className="w-5 h-5" />,
  },
  {
    titulo: "Entrando em contato",
    descricao: "Clique em 'Falar com Vendedor' ou 'Enviar Proposta' para iniciar uma conversa via WhatsApp. O contato é direto e rápido.",
    icone: <MessageCircle className="w-5 h-5" />,
  },
];

const dicas = [
  "Veja todas as fotos antes de entrar em contato — elas mostram o real estado do veículo.",
  "Leia a descrição completa do anúncio para não perder detalhes importantes.",
  "Compare o preço com veículos similares usando a busca do marketplace.",
  "Use o botão de favoritos para salvar o anúncio e comparar depois.",
  "Desconfie de preços muito abaixo da média de mercado.",
];

const AjudaDetalhes = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Detalhes do Anúncio</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-500" />
          Detalhes do Anúncio
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Visualize todas as informações do veículo: fotos, dados técnicos, preço e contato do vendedor.
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
              A página de detalhes reúne todas as informações do anúncio em um só lugar: galeria de fotos, dados completos do veículo, preço, localização e botão para contato direto com o vendedor.
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

export default AjudaDetalhes;
