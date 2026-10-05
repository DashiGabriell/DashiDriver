import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  IdCard,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando a página de Motoristas",
    descricao: "No menu lateral, clique em 'Motoristas' ou navegue pela rota /motoristas. A tela exibe a lista completa de todos os motoristas cadastrados na plataforma.",
    icone: <Users className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando a lista",
    descricao: "A listagem pode ser alternada entre visualização em grade ou tabela. Cada card exibe nome, CPF, telefone e status do motorista (Ativo, Inativo ou Suspenso).",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Buscando motoristas",
    descricao: "Utilize a barra de busca para localizar motoristas por nome, CPF ou CNH. O sistema busca em tempo real enquanto você digita.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Cadastrando novo motorista",
    descricao: "Clique em 'Novo Motorista' e preencha: nome completo, CPF, CNH com categoria e validade, telefone, email e endereço. Documentos como foto da CNH podem ser anexados.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Editando dados",
    descricao: "No card do motorista, clique no ícone de editar para alterar informações cadastrais. É possível atualizar documentos, telefone e endereço a qualquer momento.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Detalhes do motorista",
    descricao: "Acesse a página de detalhes para visualizar: dados pessoais, documentação completa (CNH, RG, CPF), histórico de locações realizadas, vínculo com veículos e ocorrências registradas.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Excluindo motorista",
    descricao: "Para remover um motorista, acesse os detalhes e clique em Excluir. A exclusão é confirmada antes de ser efetivada. Motoristas com locações ativas não podem ser excluídos.",
    icone: <Trash2 className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha a CNH dos motoristas sempre atualizada para evitar problemas em fiscalizações.",
  "Use o campo 'Observações' para registrar informações relevantes sobre cada motorista.",
  "Motoristas com status 'Suspenso' não podem realizar novas locações.",
  "Anexe foto da CNH e documentos para agilizar vistorias e contratações.",
  "Configure alertas para vencimento da CNH de cada motorista.",
];

const AjudaMotoristas = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Motoristas</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Motoristas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          O módulo de Motoristas permite gerenciar todos os condutores vinculados à sua frota, mantendo dados pessoais, documentação e histórico organizados em um só lugar.
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
              A página de Motoristas oferece cadastro completo com validação de documentos, controle de validade de CNH, histórico de locações e vínculo direto com veículos. Você pode alternar entre visualização em grade ou lista e aplicar filtros por status.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Ativo", cor: "bg-success/10 text-success" },
                { label: "Inativo", cor: "bg-muted text-muted-foreground" },
                { label: "Suspenso", cor: "bg-destructive/10 text-destructive" },
              ].map((status) => (
                <div key={status.label} className={`${status.cor} rounded-xl px-4 py-3 text-center`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{status.label}</div>
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

export default AjudaMotoristas;
