import {
  FileText,
  Eye,
  Edit3,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Image,
  Share2,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando os detalhes",
    descricao: "No 'Meu Estoque', clique no ícone de olho ou no nome do veículo para abrir a página de detalhes. Navegue também por /lojista/veiculo/:id.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando o anúncio",
    descricao: "A página exibe todas as informações do veículo: fotos em galeria, dados técnicos, preço, localização e descrição completa.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Editando informações",
    descricao: "Clique em 'Editar' para alterar dados, fotos ou preço do anúncio. As alterações são refletidas imediatamente no marketplace.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando propostas",
    descricao: "Veja o histórico de propostas recebidas para este veículo. Cada proposta mostra o interesse do comprador e permite iniciar uma negociação.",
    icone: <MessageCircle className="w-5 h-5" />,
  },
  {
    titulo: "Métricas do anúncio",
    descricao: "Acompanhe quantas visualizações o anúncio teve, quantas propostas recebeu e há quanto tempo está publicado.",
    icone: <TrendingUp className="w-5 h-5" />,
  },
  {
    titulo: "Compartilhando o anúncio",
    descricao: "Use o botão de compartilhar para enviar o link do anúncio por WhatsApp, email ou redes sociais. Aumente a visibilidade do seu veículo.",
    icone: <Share2 className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha as fotos e informações sempre atualizadas para passar credibilidade.",
  "Responda rapidamente às propostas recebidas para não perder vendas.",
  "Acompanhe as métricas para saber quais veículos têm mais interesse.",
  "Compartilhe anúncios com alto potencial em grupos e redes sociais.",
  "Veículos com descrição detalhada e histórico de manutenção vendem mais rápido.",
];

const AjudaVeiculoDetalhe = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Veículo Detalhe</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-500" />
          Veículo Detalhe
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Visualize e gerencie as informações completas de um veículo do seu estoque incluindo fotos, propostas e métricas.
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
              A página de detalhes do veículo consolida todas as informações do anúncio em um só lugar: galeria de fotos, dados completos, métricas de desempenho e propostas recebidas.
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

export default AjudaVeiculoDetalhe;
