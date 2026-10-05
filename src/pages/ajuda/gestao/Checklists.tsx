import {
  ClipboardCheck,
  Plus,
  Search,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Camera,
  Share2,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Checklists",
    descricao: "No menu lateral, clique em 'Checklists' ou navegue pela rota /checklists. A tela exibe o histórico completo de todas as vistorias realizadas na frota.",
    icone: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando o histórico",
    descricao: "A listagem mostra data, veículo, motorista e status de cada vistoria. Use os filtros para buscar por período, veículo ou tipo de checklist.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Criando um novo checklist",
    descricao: "Clique em 'Novo Checklist' para iniciar uma vistoria. Selecione o veículo e o motorista envolvidos. O formulário guia você por cada item de vistoria.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Realizando a vistoria",
    descricao: "Percorra cada item do checklist: estado dos pneus, nível de combustível, lataria, vidros, interior, itens de segurança e documentos. Cada item permite registrar OK, Não OK ou Não se Aplica, com fotos obrigatórias.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Anexando fotos",
    descricao: "Para cada item da vistoria, tire fotos direto da câmera ou selecione da galeria. As fotos são essenciais para comprovar o estado do veículo no momento da retirada e devolução.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando detalhes",
    descricao: "Após finalizar, clique no checklist para ver os detalhes completos: todas as fotos, observações, assinaturas e o status geral da vistoria.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Gerando e compartilhando PDF",
    descricao: "O sistema gera automaticamente um PDF profissional da vistoria. Use o botão de compartilhar para enviar via WhatsApp ou email diretamente para o motorista.",
    icone: <Share2 className="w-5 h-5" />,
  },
];

const dicas = [
  "Sempre registre a vistoria de check-in (retirada) e check-out (devolução) para comparar o estado do veículo.",
  "Tire fotos nítidas e com boa iluminação para evitar disputas sobre avarias.",
  "Preencha todos os campos obrigatórios para gerar o PDF corretamente.",
  "O checklist de devolução ajuda a identificar novos danos e descontar do caução se necessário.",
  "Compartilhe o PDF com o motorista logo após a vistoria para formalizar o acordo.",
];

const AjudaChecklists = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Checklists</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-blue-600" />
          Checklists
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          O módulo de Checklists permite realizar vistorias completas com fotos, gerar PDF profissional e compartilhar com o motorista. Essencial para proteger sua locadora e formalizar o estado do veículo.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Visão Geral
          </h2>
          <div className="neu p-6 bg-card border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Checklists é a ferramenta de vistoria digital da DashiDrive. Ela substitui o papel e a caneta por um fluxo moderno com fotos, assinaturas e geração automática de PDF. Cada vistoria fica armazenada no histórico para consulta futura.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Check-in", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Check-out", cor: "bg-yellow/10 text-yellow" },
                { label: "Avarias", cor: "bg-destructive/10 text-destructive" },
                { label: "PDF Automático", cor: "bg-success/10 text-success" },
              ].map((item) => (
                <div key={item.label} className={`${item.cor} rounded-xl px-4 py-3`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            Passo a Passo
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="neu p-5 bg-card border flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 grid place-items-center text-blue-600 shrink-0 mt-0.5">
                  {step.icone}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Passo {index + 1}</span>
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

export default AjudaChecklists;
