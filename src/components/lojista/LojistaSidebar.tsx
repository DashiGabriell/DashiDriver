import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { motion } from "framer-motion";

// Helper para ícones PNG customizados
export const SidebarIcon = ({ 
  src, 
  label, 
  className = "w-[24px] h-[24px]" 
}: { 
  src: string;
  label: string;
  className?: string;
}) => (
  <img 
    src={src} 
    alt={label}
    className={`${className} object-contain`}
    loading="lazy"
  />
);

interface SidebarItem {
  to: string;
  label: string;
  icon: JSX.Element;
  end?: boolean;
}

const items: SidebarItem[] = [
  { to: "/lojista/hub", label: "Lojista Hub", icon: <SidebarIcon src="/assets/sidebar-dashboard.png" label="Hub" />, end: true },
  { to: "/lojista/oportunidades", label: "Oportunidades", icon: <SidebarIcon src="/assets/sidebar-oportunidades.png" label="Oportunidades" /> },
  { to: "/lojista/estoque", label: "Meu Estoque", icon: <SidebarIcon src="/assets/sidebar-carro.png" label="Estoque" /> },
  { to: "/lojista/analytics", label: "Analytics", icon: <SidebarIcon src="/assets/sidebar-lucratividade.png" label="Analytics" /> },
  { to: "/lojista/assinatura", label: "Assinatura", icon: <SidebarIcon src="/assets/sidebar-parcelaseguro.png" label="Assinatura" /> },
  { to: "/lojista/perfil", label: "Perfil", icon: <SidebarIcon src="/assets/sidebar-perfil.png" label="Perfil" /> },
  { to: "/lojista/configuracoes", label: "Configurações", icon: <SidebarIcon src="/assets/sidebar-settings.png" label="Configurações" /> },
];

export const LojistaSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const sidebarWidthClass = collapsed ? "w-[6.75rem]" : "w-64";
  const alignContentClass = collapsed ? "justify-center" : "justify-start";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {

      navigate("/login");
    }
  };

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 ${sidebarWidthClass} p-5 gap-3 sticky top-0 h-screen overflow-hidden transition-all duration-300 ease-in-out neu`}
    >
      <div className={`flex items-center gap-3 px-2 py-3 mb-2 transition-all duration-300 ${alignContentClass}`}>
        <img src="/assets/loading-carcontrol-coelho.gif" alt="DashiDrive Logo" className="w-14 h-14 object-contain" />
        <div className={`${collapsed ? "hidden" : "block"} transition-opacity duration-300`}>
          <div className="font-display font-bold text-lg leading-none">DashiDrive</div>
          <div className="text-[11px] text-muted-foreground tracking-wide uppercase mt-1">Portal Lojista</div>
        </div>
      </div>

      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 px-2 transition-all duration-300`}>
        <div className={`${collapsed ? "hidden" : "block"} text-sm font-semibold text-muted-foreground`}>Navegação</div>
        <button
          type="button"
          onClick={() => setCollapsed((state) => !state)}
          className="neu-sm h-9 w-9 grid place-items-center rounded-full text-muted-foreground transition-all duration-300 hover:text-foreground"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
        {items.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 ${alignContentClass} px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300
              ${isActive ? "neu-press text-foreground" : "text-muted-foreground hover:text-foreground hover:neu-sm"}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div animate={isActive ? { y: [0, -8, 0] } : { y: 0 }} transition={{ duration: 0.6 }}>
                  {icon}
                </motion.div>
                <span className={`${collapsed ? "hidden" : "block"}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="neu p-4 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
             <img src="/public/assets/loja.png" alt="Logo Loja" className="w-10 h-10 object-contain" />
             {!collapsed && (
               <div>
                  <div className="font-bold text-sm truncate max-w-[120px]">Nome da Loja</div>
                  <div className="text-xs text-muted-foreground">Plano Pro</div>
               </div>
             )}
        </div>
      </div>
    </aside>
  );
};
