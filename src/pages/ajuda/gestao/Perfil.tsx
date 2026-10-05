import {
  User,
  Edit3,
  Save,
  Camera,
  Sun,
  Moon,
  Lock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Mail,
  Smartphone,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando o Perfil",
    descricao: "No menu lateral, clique em 'Meu Perfil' ou navegue pela rota /perfil. A tela exibe seus dados pessoais e configurações da conta.",
    icone: <User className="w-5 h-5" />,
  },
  {
    titulo: "Editando dados pessoais",
    descricao: "Na seção 'Dados Pessoais', você pode editar nome, email e telefone. Clique em Salvar para confirmar as alterações.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Alterando foto do perfil",
    descricao: "Clique sobre a foto ou avatar para alterar sua imagem de perfil. Você pode fazer upload de uma nova foto ou remover a atual.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Configurando o tema",
    descricao: "Na seção 'Preferências', escolha entre tema Claro, Escuro ou Automático (segue a configuração do sistema). A mudança é aplicada em tempo real.",
    icone: <Sun className="w-5 h-5" />,
  },
  {
    titulo: "Gerenciando notificações",
    descricao: "Configure quais notificações deseja receber: alertas críticos, operacionais, lembretes de manutenção e vencimentos. Você pode ativar ou desativar cada tipo.",
    icone: <Bell className="w-5 h-5" />,
  },
  {
    titulo: "Alterando a senha",
    descricao: "Na seção 'Segurança', clique em 'Alterar Senha'. Informe a senha atual, a nova senha e confirme. A senha deve ter no mínimo 8 caracteres com letras e números.",
    icone: <Lock className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando dados da conta",
    descricao: "A seção 'Conta' exibe informações do seu plano de assinatura, data de cadastro e status da conta. É possível gerenciar sua assinatura por aqui.",
    icone: <Mail className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha seu email e telefone atualizados para receber notificações importantes.",
  "Altere sua senha periodicamente para manter a segurança da conta.",
  "Use o tema escuro à noite para reduzir o cansaço visual.",
  "Configure as notificações de acordo com sua rotina para evitar excesso de alertas.",
  "A foto do perfil ajuda outros usuários a identificar você na plataforma.",
];

const AjudaPerfil = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Perfil</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          Perfil
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Configure seus dados pessoais, preferências do sistema e personalize sua experiência na plataforma DashiDrive.
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
              A página de Perfil centraliza todas as configurações da sua conta. Aqui você edita seus dados pessoais, altera a senha, configura preferências de tema e notificações, e gerencia sua assinatura.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Dados Pessoais", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Segurança", cor: "bg-success/10 text-success" },
                { label: "Preferências", cor: "bg-yellow/10 text-yellow" },
                { label: "Assinatura", cor: "bg-purple-500/10 text-purple-600" },
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

export default AjudaPerfil;
