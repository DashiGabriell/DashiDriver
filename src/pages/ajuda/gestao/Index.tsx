import { HelpCard } from "@/components/ajuda/gestao/HelpCard";
import {
  Car,
  Users,
  ClipboardCheck,
  Wallet,
  CreditCard,
  Wrench,
  TrendingUp,
  Bell,
  UserCog,
  User,
} from "lucide-react";

const ferramentas = [
  {
    titulo: "Veículos",
    descricao: "Gerencie toda a frota em um só lugar. Cadastre novos veículos, edite informações, acompanhe status e acesse o histórico completo de cada unidade.",
    icone: <Car className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/veiculos",
    detalhes: [
      "Cadastro completo com placa, renavam, chassis e documentos",
      "Status visual: disponível, alugado, em manutenção",
      "Histórico de aluguéis, multas e ocorrências",
      "Filtros avançados e busca rápida",
    ],
  },
  {
    titulo: "Motoristas",
    descricao: "Mantenha uma base organizada de motoristas com dados pessoais, documentação e histórico de vínculos com a frota.",
    icone: <Users className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/motoristas",
    detalhes: [
      "Cadastro com CNH, RG, CPF e endereço",
      "Controle de validade de documentos",
      "Histórico de locações e ocorrências",
      "Vínculo direto com veículos alugados",
    ],
  },
  {
    titulo: "Checklists",
    descricao: "Realize vistorias completas com fotos, gere PDF profissional e compartilhe com o motorista em segundos.",
    icone: <ClipboardCheck className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/checklists",
    detalhes: [
      "Check-in e check-out com fotos obrigatórias",
      "Geração automática de PDF",
      "Compartilhamento via WhatsApp",
      "Histórico completo de todas as vistorias",
    ],
  },
  {
    titulo: "Pagamentos",
    descricao: "Controle financeiro completo com contas a pagar e receber, status de cada transação e comprovantes anexados.",
    icone: <Wallet className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/pagamentos",
    detalhes: [
      "Registro de recebimentos e despesas",
      "Status: pendente, pago, atrasado, cancelado",
      "Anexo de comprovantes e notas fiscais",
      "Filtros por período, veículo e categoria",
    ],
  },
  {
    titulo: "Financiamento & Seguro",
    descricao: "Acompanhe parcelas recorrentes de financiamentos e seguros veiculares sem nunca perder um vencimento.",
    icone: <CreditCard className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/financiamento-seguro",
    detalhes: [
      "Cadastro de contratos de financiamento",
      "Controle de apólices de seguro",
      "Alertas de vencimento de parcelas",
      "Histórico de pagamentos por veículo",
    ],
  },
  {
    titulo: "Manutenção",
    descricao: "Gerencie manutenções preventivas e corretivas da frota com agendamento, custos e histórico detalhado.",
    icone: <Wrench className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/manutencao",
    detalhes: [
      "Agendamento de manutenções preventivas",
      "Registro de manutenções corretivas com fotos",
      "Controle de custos por veículo e período",
      "Notificações de revisões programadas",
    ],
  },
  {
    titulo: "Lucratividade",
    descricao: "Dashboard financeiro com KPIs de receitas, despesas e lucro por veículo para decisões estratégicas.",
    icone: <TrendingUp className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/lucratividade",
    detalhes: [
      "Receitas vs despesas por veículo",
      "Gráficos de performance financeira",
      "Indicadores de lucro líquido",
      "Comparativo mensal e anual",
    ],
  },
  {
    titulo: "Alertas",
    descricao: "Central de notificações com alertas críticos e operacionais sobre manutenção, vencimentos e pendências.",
    icone: <Bell className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/alertas",
    detalhes: [
      "Alertas críticos: vencimentos e irregularidades",
      "Notificações operacionais do dia a dia",
      "Opção de marcar como lido e limpar",
      "Integração com sinos e notificações push",
    ],
  },
  {
    titulo: "Usuários",
    descricao: "Gerencie acessos, cargos e permissões dos usuários da plataforma com segurança e controle.",
    icone: <UserCog className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/usuarios",
    detalhes: [
      "Cadastro e bloqueio de usuários",
      "Definição de cargos e permissões",
      "Controle de acesso por funcionalidade",
      "Auditoria de atividades dos usuários",
    ],
  },
  {
    titulo: "Perfil",
    descricao: "Configure seus dados pessoais, preferências do sistema e personalize sua experiência na plataforma.",
    icone: <User className="w-6 h-6" />,
    rotaAjuda: "/ajuda/gestao/perfil",
    detalhes: [
      "Edição de nome, email e avatar",
      "Preferências de tema e notificações",
      "Alteração de senha",
      "Dados da conta e assinatura",
    ],
  },
];

const AjudaGestao = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span className="text-foreground font-medium">Gestão</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          Gestão
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Aprenda a utilizar todas as ferramentas do módulo de gestão da DashiDrive. Selecione um tema para ver o guia completo.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {ferramentas.map((ferramenta) => (
          <HelpCard
            key={ferramenta.titulo}
            titulo={ferramenta.titulo}
            descricao={ferramenta.descricao}
            icone={ferramenta.icone}
            rotaAjuda={ferramenta.rotaAjuda}
            detalhes={ferramenta.detalhes}
          />
        ))}
      </div>
    </div>
  );
};

export default AjudaGestao;
