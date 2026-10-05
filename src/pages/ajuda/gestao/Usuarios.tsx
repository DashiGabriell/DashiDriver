import {
  UserCog,
  Plus,
  Search,
  Edit3,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Lock,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Usuários",
    descricao: "No menu lateral, clique em 'Usuários' ou navegue pela rota /usuarios. A tela exibe todos os usuários cadastrados na plataforma com seus respectivos cargos.",
    icone: <UserCog className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando a lista",
    descricao: "Cada usuário é exibido com nome, email, cargo e status. Use a busca para localizar rapidamente um usuário específico.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Cadastrando novo usuário",
    descricao: "Clique em 'Novo Usuário' para adicionar. Informe nome, email e selecione o cargo. O usuário receberá um convite por email para criar sua senha e acessar o sistema.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Definindo cargos e permissões",
    descricao: "Cada cargo possui permissões específicas: Admin (acesso total), Gerente (operações e financeiro), Operador (checklists e veículos) e Visualizador (apenas leitura).",
    icone: <Shield className="w-5 h-5" />,
  },
  {
    titulo: "Editando usuário",
    descricao: "Clique no ícone de editar para alterar nome, email ou cargo de um usuário. Mudanças de cargo afetam imediatamente as permissões de acesso.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Bloqueando acesso",
    descricao: "Para remover temporariamente o acesso de um usuário, altere o status para 'Inativo'. O usuário não conseguirá mais acessar o sistema até ser reativado.",
    icone: <Lock className="w-5 h-5" />,
  },
  {
    titulo: "Excluindo usuário",
    descricao: "Para remover permanentemente um usuário, clique em Excluir. A ação é irreversível. Registros criados pelo usuário (veículos, motoristas) permanecem no sistema.",
    icone: <Trash2 className="w-5 h-5" />,
  },
];

const dicas = [
  "Crie cargos com permissões mínimas necessárias para cada função (princípio do menor privilégio).",
  "Revise periodicamente a lista de usuários ativos e remova acessos desnecessários.",
  "Utilize o cargo 'Visualizador' para sócios ou investistas que precisam apenas consultar dados.",
  "Mantenha sempre ao menos dois usuários com cargo Admin para contingência.",
  "Altere a senha imediatamente se suspeitar que um acesso foi comprometido.",
];

const AjudaUsuarios = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Usuários</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <UserCog className="w-8 h-8 text-blue-600" />
          Usuários
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie acessos, cargos e permissões dos usuários da plataforma. Controle quem pode visualizar, editar ou administrar cada recurso do sistema.
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
              O módulo de Usuários permite gerenciar quem tem acesso à plataforma e quais permissões cada pessoa possui. Com cargos pré-definidos, você controla o nível de acesso de forma simples e segura.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Admin", cor: "bg-destructive/10 text-destructive" },
                { label: "Gerente", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Operador", cor: "bg-yellow/10 text-yellow" },
                { label: "Visualizador", cor: "bg-muted text-muted-foreground" },
              ].map((cargo) => (
                <div key={cargo.label} className={`${cargo.cor} rounded-xl px-4 py-3 text-center`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{cargo.label}</div>
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

export default AjudaUsuarios;
