import { HelpCard } from "@/components/ajuda/gestao/HelpCard";
import {
  LayoutDashboard,
  Target,
  Package,
  PlusCircle,
  FileText,
  BarChart3,
  CreditCard,
  User,
  Settings,
} from "lucide-react";

const ferramentas = [
  {
    titulo: "Portal do Lojista",
    descricao: "Hub central com KPIs, oportunidades disponíveis e visão geral das operações do lojista em tempo real.",
    icone: <LayoutDashboard className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/hub",
    detalhes: [
      "KPIs de oportunidades, interações e vendas",
      "Tabela de oportunidades disponíveis",
      "Indicadores de taxa de conversão",
      "Acesso rápido a todas as ferramentas",
    ],
  },
  {
    titulo: "Oportunidades",
    descricao: "Leads e oportunidades de negócio com filtros por localização, modelo, preço e quantidade de veículos.",
    icone: <Target className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/oportunidades",
    detalhes: [
      "Lista de oportunidades com detalhes da demanda",
      "Filtros avançados por estado, cidade e modelo",
      "Visualização de orçamento e quantidade",
      "Contato direto com a locadora interessada",
    ],
  },
  {
    titulo: "Meu Estoque",
    descricao: "Gestão completa do estoque de veículos com tabela, status e ações rápidas de edição e visualização.",
    icone: <Package className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/estoque",
    detalhes: [
      "Listagem de veículos com foto, modelo e preço",
      "Status: disponível, vendido ou reservado",
      "Ações rápidas: editar, ver detalhes, remover",
      "Botão para adicionar novo veículo",
    ],
  },
  {
    titulo: "Novo Veículo",
    descricao: "Cadastro completo de veículo no estoque com fotos, informações técnicas e preço de venda.",
    icone: <PlusCircle className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/novo-veiculo",
    detalhes: [
      "Cadastro com fotos do veículo",
      "Informações: modelo, ano, km, preço",
      "Dados de localização e contato",
      "Publicação automática no marketplace",
    ],
  },
  {
    titulo: "Veículo Detalhe",
    descricao: "Página de detalhes e edição de um veículo específico do estoque com todas as informações do anúncio.",
    icone: <FileText className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/veiculo-detalhe",
    detalhes: [
      "Visualização completa do anúncio",
      "Edição de fotos e informações",
      "Histórico de propostas recebidas",
      "Status e métricas de visualização",
    ],
  },
  {
    titulo: "Analytics",
    descricao: "Métricas e análises de desempenho do lojista com gráficos de visualizações, propostas e vendas.",
    icone: <BarChart3 className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/analytics",
    detalhes: [
      "Gráficos de desempenho de anúncios",
      "Propostas recebidas vs. convertidas",
      "Análise de visualizações por veículo",
      "Relatórios de performance da loja",
    ],
  },
  {
    titulo: "Assinatura",
    descricao: "Gerenciamento do plano de assinatura do lojista com informações de faturamento e vencimento.",
    icone: <CreditCard className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/assinatura",
    detalhes: [
      "Plano atual e valor mensal",
      "Próximo vencimento e histórico",
      "Upgrade ou downgrade de plano",
      "Métodos de pagamento disponíveis",
    ],
  },
  {
    titulo: "Perfil",
    descricao: "Dados e configurações do perfil do lojista com informações da loja e dados de contato.",
    icone: <User className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/perfil",
    detalhes: [
      "Informações da loja e dados cadastrais",
      "Edição de endereço e contato",
      "Logo e fotos da loja",
      "Redes sociais e site",
    ],
  },
  {
    titulo: "Configurações",
    descricao: "Configurações gerais do portal do lojista incluindo preferências de notificação e integrações.",
    icone: <Settings className="w-6 h-6" />,
    rotaAjuda: "/ajuda/lojista/configuracoes",
    detalhes: [
      "Preferências de notificação",
      "Integrações com WhatsApp e email",
      "Configurações de privacidade",
      "Personalização do portal",
    ],
  },
];

const AjudaLojista = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span className="text-foreground font-medium">Lojista</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          Lojista
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Aprenda a utilizar todas as ferramentas do Portal do Lojista. Selecione um tema para ver o guia completo.
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

export default AjudaLojista;
