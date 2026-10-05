import {
  Car,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando a página de Veículos",
    descricao: "No menu lateral esquerdo, clique no ícone de Veículos ou navegue diretamente pela rota /veiculos. Você será direcionado para a lista completa da frota.",
    icone: <Car className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando a frota",
    descricao: "A tela principal exibe todos os veículos cadastrados em formato de lista ou grade. Cada card mostra informações como placa, modelo, ano e status atual (Disponível, Alugado, Em Manutenção).",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Buscando e filtrando",
    descricao: "Use a barra de busca para localizar veículos por placa, modelo ou renavam. Os filtros avançados permitem refinar por status, ano, marca e categoria.",
    icone: <Filter className="w-5 h-5" />,
  },
  {
    titulo: "Cadastrando um novo veículo",
    descricao: "Clique no botão 'Novo Veículo' para abrir o formulário de cadastro. Preencha os dados obrigatórios: placa, renavam, chassi, modelo, ano, marca, cor, combustível e categoria. Documentos como CRLV podem ser anexados.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Editando informações",
    descricao: "No card ou linha do veículo, clique no ícone de editar (lápis) para alterar dados cadastrais. É possível atualizar fotos, documentos e status a qualquer momento.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Detalhes do veículo",
    descricao: "Ao clicar em um veículo, você acessa a página de detalhes com: informações gerais, histórico de aluguéis, manutenções realizadas, checklist de vistorias, documentos anexados e financeiro vinculado.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Excluindo veículo",
    descricao: "Para remover um veículo da frota, acesse os detalhes e clique em Excluir. A exclusão é irreversível, por isso o sistema solicita confirmação. Veículos com histórico de locação ativo não podem ser excluídos.",
    icone: <Trash2 className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha os documentos sempre atualizados para evitar bloqueios na hora de alugar.",
  "Use os filtros de status para localizar rapidamente veículos disponíveis.",
  "Anexe fotos de qualidade para facilitar a identificação visual da frota.",
  "O campo 'Observações' é útil para registrar avarias ou informações extras.",
  "Configure alertas para vencimento de documentos de cada veículo.",
];

const AjudaVeiculos = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Veículos</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Car className="w-8 h-8 text-blue-600" />
          Veículos
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          O módulo de Veículos é o coração da gestão da frota. Aqui você cadastra, edita, monitora e acompanha todo o ciclo de vida de cada veículo da sua locadora.
        </p>
      </header>

      <div className="space-y-12">
        {/* Visão Geral */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Visão Geral
          </h2>
          <div className="neu p-6 bg-card border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A página de Veículos oferece uma visão completa de toda a frota em tempo real. Você pode alternar entre visualização em grade ou lista, aplicar filtros por status e acessar rapidamente as ações mais importantes como cadastrar, editar ou visualizar detalhes de cada veículo.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Disponível", cor: "bg-success/10 text-success" },
                { label: "Alugado", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Em Manutenção", cor: "bg-yellow/10 text-yellow" },
                { label: "Inativo", cor: "bg-destructive/10 text-destructive" },
              ].map((status) => (
                <div key={status.label} className={`${status.cor} rounded-xl px-4 py-3 text-center`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{status.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Passo a Passo */}
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
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                      Passo {index + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold mb-1">{step.titulo}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dicas */}
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

export default AjudaVeiculos;
