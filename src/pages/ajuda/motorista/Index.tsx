import {
  Users,
  LayoutDashboard,
  ClipboardCheck,
  Truck,
  Wallet,
  CalendarCheck,
  Wrench,
  Bell,
  User,
} from "lucide-react";
import { HelpCard } from "@/components/ajuda/gestao/HelpCard";

const ferramentas = [
  {
    titulo: "Início",
    descricao: "Dashboard com KPIs financeiros e atalhos rápidos para as principais funcionalidades.",
    icone: <LayoutDashboard className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/inicio",
    detalhes: [
      "KPIs de recebimentos e valores",
      "Atalhos para checklists, frota e motoristas",
      "Resumo financeiro do dia",
    ],
  },
  {
    titulo: "Checklists",
    descricao: "Realize vistorias de check-in e check-out com fotos e gere laudos completos.",
    icone: <ClipboardCheck className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/checklists",
    detalhes: [
      "Check-in e check-out com fotos",
      "Geração de PDF profissional",
      "Compartilhamento via WhatsApp",
    ],
  },
  {
    titulo: "Frota",
    descricao: "Gerencie veículos e motoristas em abas separadas com busca e detalhes.",
    icone: <Truck className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/frota",
    detalhes: [
      "Alternância entre veículos e motoristas",
      "Card com score e status",
      "BottomSheet com ações rápidas",
    ],
  },
  {
    titulo: "Motoristas",
    descricao: "Lista completa de motoristas com busca, status e acesso aos detalhes.",
    icone: <Users className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/motoristas",
    detalhes: [
      "Busca por nome ou CPF",
      "Status visual (ativo/inativo/suspenso)",
      "Acesso a detalhes e documentos",
    ],
  },
  {
    titulo: "Pagamentos",
    descricao: "Acompanhe pagamentos de motoristas com histórico e status.",
    icone: <Wallet className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/pagamentos",
    detalhes: [
      "Histórico de pagamentos",
      "Status: pago, pendente, atrasado",
      "Filtros por período",
    ],
  },
  {
    titulo: "Aluguéis",
    descricao: "Gerencie contratos de aluguel e acompanhe veículos alugados.",
    icone: <CalendarCheck className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/alugueis",
    detalhes: [
      "Contratos ativos e histórico",
      "Datas de vencimento",
      "Valores e parcelas",
    ],
  },
  {
    titulo: "Manutenção",
    descricao: "Registre e acompanhe manutenções dos veículos da frota.",
    icone: <Wrench className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/manutencao",
    detalhes: [
      "Registro de manutenções",
      "Histórico por veículo",
      "Notificações de vencimento",
    ],
  },
  {
    titulo: "Alertas",
    descricao: "Central de notificações com alertas de documentos, manutenção e pagamentos.",
    icone: <Bell className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/alertas",
    detalhes: [
      "Alertas de documentos vencendo",
      "Notificações de manutenção",
      "Alertas de pagamentos",
    ],
  },
  {
    titulo: "Perfil",
    descricao: "Gerencie suas informações pessoais, foto e preferências da conta.",
    icone: <User className="w-6 h-6" />,
    rotaAjuda: "/ajuda/motorista/perfil",
    detalhes: [
      "Dados pessoais e foto",
      "Preferências do app",
      "Configurações de conta",
    ],
  },
];

const AjudaMotorista = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span className="text-foreground font-medium">Motorista</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-500" />
          Ajuda do Motorista
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Tire o máximo proveito do aplicativo mobile DashiDrive. Confira abaixo as ferramentas disponíveis.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ferramentas.map((f) => (
          <HelpCard
            key={f.rotaAjuda}
            titulo={f.titulo}
            descricao={f.descricao}
            icone={f.icone}
            rotaAjuda={f.rotaAjuda}
            detalhes={f.detalhes}
          />
        ))}
      </div>
    </div>
  );
};

export default AjudaMotorista;
