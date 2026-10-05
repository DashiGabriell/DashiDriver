import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
// Import only the chevron icons needed for the collapse button.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
// Reutiliza o componente de ícone customizado usado no Sidebar
import { SidebarIcon } from "@/components/layout/Sidebar";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  to,
  isActive,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-[72px] h-full py-2 transition-all duration-200 touch-target shrink-0"
    >
      {/* Ícone com animação de salto */}
      <motion.div
        animate={
          isActive
            ? {
                y: [0, -4, 0],
              }
            : {
                y: 0,
              }
        }
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: isActive ? Infinity : 0,
          repeatDelay: 3,
        }}
        className="relative z-10"
      >
        {Icon}
      </motion.div>

      {/* Label */}
      <span
        className={`text-[10px] mt-1 font-medium transition-colors duration-200 relative z-10 ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </NavLink>
  );
};

export const MobileNavbar = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Todos os itens de navegação
  const allNavItems = [
    { icon: <div style={{ transform: "translateY(-15px)", scale: "1.5" }}><SidebarIcon src="/assets/sidebar-dashboard.png" label="Início" /></div>, label: "Início", to: "/" },
    { icon: <SidebarIcon src="/assets/sidebar-carro.png" label="Veículos" />, label: "Veículos", to: "/veiculos" },
    { icon: <SidebarIcon src="/assets/sidebar-motoristas.png" label="Motoristas" />, label: "Motoristas", to: "/motoristas" },
    { icon: <SidebarIcon src="/assets/sidebar-recebimentos.png" label="Pagamentos" />, label: "Pagamentos", to: "/pagamentos" },
    { icon: <SidebarIcon src="/assets/sidebar-parcelaseguro.png" label="Financiamento" />, label: "Financiamento", to: "/financiamento-seguro" },
    { icon: <SidebarIcon src="/assets/sidebar-ferramentas.png" label="Manutenção" />, label: "Manutenção", to: "/manutencao" },
    { icon: <SidebarIcon src="/assets/sidebar-lucratividade.png" label="Lucro" />, label: "Lucro", to: "/lucratividade" },
    { icon: <SidebarIcon src="/assets/sidebar-alertas.png" label="Alertas" />, label: "Alertas", to: "/alertas" },
    { icon: <SidebarIcon src="/assets/sidebar-users.png" label="Usuários" />, label: "Usuários", to: "/usuarios" },
    { icon: <SidebarIcon src="/assets/sidebar-perfil.png" label="Perfil" />, label: "Perfil", to: "/perfil" },
  ];

  // Constantes para controle de visualização
  const ITEMS_VISIVEIS = 4;
  const ITEM_WIDTH = 72; // largura fixa de cada item

  // Garantir que o navbar seja sempre visível
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Atualizar índice ativo baseado na rota atual
  useEffect(() => {
    const currentIndex = allNavItems.findIndex((item) => {
      if (item.to === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(item.to);
    });
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
      // Scroll automático para o item ativo
      scrollToItem(currentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Função para scroll suave até o item
  const scrollToItem = (index: number) => {
    if (scrollContainerRef.current) {
      // Calcula a posição para mostrar o item no início da área visível
      const scrollLeft = Math.max(0, index * ITEM_WIDTH);
      
      scrollContainerRef.current.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Navegar para esquerda (mostra 4 itens anteriores)
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - (ITEM_WIDTH * ITEMS_VISIVEIS));
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  // Navegar para direita (mostra 4 próximos itens)
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.offsetWidth;
      const newPosition = Math.min(maxScroll, scrollPosition + (ITEM_WIDTH * ITEMS_VISIVEIS));
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  // Atualizar posição do scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  // Verificar se pode scrollar
  const canScrollLeft = scrollPosition > 5;
  const canScrollRight = scrollContainerRef.current
    ? scrollPosition < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.offsetWidth - 5
    : true; // Assume true inicialmente

  if (!isVisible) return null;

  return (
    <nav 
      className="w-full bg-background border-t border-border"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(64px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="relative flex items-center h-16 w-full">
        {/* Indicador animado no topo - CORRIGIDO */}
        <motion.div
          className="absolute top-0 h-[3px] bg-primary rounded-full z-10"
          animate={{
            left: `calc(${activeIndex * ITEM_WIDTH}px - ${scrollPosition}px + 16px)`,
            width: "40px",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />

        {/* Botão de navegação esquerda - SEMPRE VISÍVEL */}
        <button
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          className={`absolute left-0 z-30 h-full w-12 flex items-center justify-center bg-gradient-to-r from-background via-background/95 to-transparent transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-30'
          }`}
          aria-label="Navegar para esquerda"
        >
          <ChevronLeft 
            className={`w-6 h-6 transition-colors ${
              canScrollLeft ? 'text-primary' : 'text-muted-foreground'
            }`} 
            strokeWidth={2.5} 
          />
        </button>

        {/* Container de itens com scroll horizontal - LARGURA FIXA para 4 itens */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-center overflow-x-auto scrollbar-none h-full mx-12"
          style={{
            width: `${ITEM_WIDTH * ITEMS_VISIVEIS}px`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {allNavItems.map((item, index) => (
            <div
              key={item.to}
              style={{
                scrollSnapAlign: "start",
                width: `${ITEM_WIDTH}px`,
              }}
            >
              <NavItem
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={activeIndex === index}
                onClick={() => {
                  setActiveIndex(index);
                  scrollToItem(index);
                }}
              />
            </div>
          ))}
        </div>

        {/* Botão de navegação direita - SEMPRE VISÍVEL */}
        <button
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          className={`absolute right-0 z-30 h-full w-12 flex items-center justify-center bg-gradient-to-l from-background via-background/80 to-transparent transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-30'
          }`}
          aria-label="Navegar para direita"
        >
          <ChevronRight 
            className={`w-6 h-6 transition-colors ${
              canScrollRight ? 'text-primary' : 'text-muted-foreground'
            }`} 
            strokeWidth={2.5} 
          />
        </button>
      </div>

      {/* CSS para esconder scrollbar */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};
