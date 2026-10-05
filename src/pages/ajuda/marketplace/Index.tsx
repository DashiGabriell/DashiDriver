import {
  ShoppingBag,
  LayoutDashboard,
  Search,
  FileText,
  PlusCircle,
  Heart,
  User,
  Package,
  MessageCircle,
  ClipboardCheck,
  ListChecks,
} from "lucide-react";
import { HelpCard } from "@/components/ajuda/gestao/HelpCard";

const ferramentas = [
  {
    titulo: "Início",
    descricao: "Vitrine principal com banner, categorias e veículos em destaque.",
    icone: <LayoutDashboard className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/home",
    detalhes: [
      "Banner promocional animado",
      "Categorias para navegação rápida",
      "Veículos em destaque",
    ],
  },
  {
    titulo: "Buscar",
    descricao: "Encontre veículos com busca por texto, cidade, preço e categoria.",
    icone: <Search className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/buscar",
    detalhes: [
      "Autocomplete inteligente",
      "Filtros por preço, ano e localização",
      "Ordenação por relevância",
    ],
  },
  {
    titulo: "Detalhes do Anúncio",
    descricao: "Visualize fotos, informações completas e entre em contato com o vendedor.",
    icone: <FileText className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/detalhes",
    detalhes: [
      "Galeria de fotos completa",
      "Dados técnicos do veículo",
      "Contato direto com o vendedor",
    ],
  },
  {
    titulo: "Anunciar Veículo",
    descricao: "Publique seu veículo para venda no marketplace.",
    icone: <PlusCircle className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/anunciar",
    detalhes: [
      "Formulário completo de cadastro",
      "Upload de fotos",
      "Publicação imediata",
    ],
  },
  {
    titulo: "Favoritos",
    descricao: "Salve veículos favoritos e acompanhe suas oportunidades.",
    icone: <Heart className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/favoritos",
    detalhes: [
      "Lista de veículos salvos",
      "Comparação entre anúncios",
      "Notificação de alteração de preço",
    ],
  },
  {
    titulo: "Perfil",
    descricao: "Gerencie suas informações de vendedor no marketplace.",
    icone: <User className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/perfil",
    detalhes: [
      "Dados do vendedor",
      "Avaliações recebidas",
      "Foto de perfil",
    ],
  },
  {
    titulo: "Meus Anúncios",
    descricao: "Acompanhe e gerencie todos os seus anúncios ativos.",
    icone: <Package className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/meus-anuncios",
    detalhes: [
      "Listagem de anúncios",
      "Ativar/desativar anúncios",
      "Acompanhamento de leads",
    ],
  },
  {
    titulo: "Propostas",
    descricao: "Visualize e responda propostas recebidas nos seus anúncios.",
    icone: <MessageCircle className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/propostas",
    detalhes: [
      "Leads recebidos",
      "Contato via WhatsApp",
      "Histórico de interações",
    ],
  },
  {
    titulo: "Inspeção",
    descricao: "Realize inspeções veiculares detalhadas.",
    icone: <ClipboardCheck className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/inspecao",
    detalhes: [
      "Checklist completo de itens",
      "Fotos por item",
      "Laudo final",
    ],
  },
  {
    titulo: "Lista de Inspeções",
    descricao: "Acompanhe todas as inspeções realizadas em seus veículos.",
    icone: <ListChecks className="w-6 h-6" />,
    rotaAjuda: "/ajuda/marketplace/lista-inspecoes",
    detalhes: [
      "Histórico completo",
      "Filtros por data e status",
      "Acesso aos laudos",
    ],
  },
];

const AjudaMarketplace = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span className="text-foreground font-medium">Marketplace</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-cyan-500" />
          Ajuda do Marketplace
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Tire o máximo proveito do Marketplace DashDrive. Confira abaixo as ferramentas disponíveis.
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

export default AjudaMarketplace;
