import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Users, Wallet, Wrench, Bell, TrendingUp, LogOut, ChevronLeft, ChevronRight, User, CreditCard, UserCog } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";
import { motion } from "framer-motion";

// Componente para renderizar ícones PNG customizados
export const SidebarIcon = ({ 
  src, 
  label, 
  className = "w-[18px] h-[18px]" 
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

// Cada item contém o JSX do ícone já configurado. Isso evita problemas de tipagem ao renderizar.
const items = [
  {
    to: "/dashboard",
    label: "Painel",
    // Ícone customizado em PNG
    icon: <SidebarIcon src="/assets/sidebar-dashboard.png" label="Painel" />, 
    end: true,
  },
  // Ícone customizado para Veículos
  { to: "/veiculos", label: "Veículos", icon: <SidebarIcon src="/assets/sidebar-carro.png" label="Veículos" />, },
  // Ícone customizado para Motoristas
  { to: "/motoristas", label: "Motoristas", icon: <SidebarIcon src="/assets/sidebar-motoristas.png" label="Motoristas" />, },
  // Ícone customizado para Checklists
  { to: "/checklists", label: "Checklists", icon: <SidebarIcon src="/assets/checklist-sideabar.png" label="Checklists" />, },
  // Ícone customizado para Recebimentos
  { to: "/pagamentos", label: "Recebimentos", icon: <SidebarIcon src="/assets/sidebar-recebimentos.png" label="Recebimentos" />, },
  // Ícone customizado para Financiamento & Seguro
  { to: "/financiamento-seguro", label: "Financiamento & Seguro", icon: <SidebarIcon src="/assets/sidebar-parcelaseguro.png" label="Financiamento & Seguro" />, },
  // Ícone customizado para Manutenção
  { to: "/manutencao", label: "Manutenção", icon: <SidebarIcon src="/assets/sidebar-ferramentas.png" label="Manutenção" />, },
  // Ícone customizado para Lucratividade
  { to: "/lucratividade", label: "Lucratividade", icon: <SidebarIcon src="/assets/sidebar-lucratividade.png" label="Lucratividade" />, },
  // Ícone customizado para Controle de KM
  { to: "/controle-km", label: "Controle de KM", icon: <SidebarIcon src="/assets/sidebar-km.png" label="Controle de KM" />, },
  // Ícone customizado para Alertas
  { to: "/alertas", label: "Alertas", icon: <SidebarIcon src="/assets/sidebar-alertas.png" label="Alertas" />, },
  // Ícone customizado para Usuários
  { to: "/usuarios", label: "Usuários", icon: <SidebarIcon src="/assets/sidebar-users.png" label="Usuários" /> },
  // Ícone customizado para Meu Perfil
  { to: "/perfil", label: "Meu Perfil", icon: <SidebarIcon src="/assets/sidebar-perfil.png" label="Meu Perfil" /> },
  // Ícone customizado para Suporte
  { to: "/suporte", label: "Suporte", icon: <SidebarIcon src="/assets/suporte.png" label="Suporte" /> },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { session, signOut } = useAuth();
  const { profile, userRole } = useCarcontrolUser();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  
  const userEmail = session?.user?.email || "";
  const userName = profile?.nome || userEmail.split("@")[0] || "Usuário";
  const userInitials = userName.slice(0, 2).toUpperCase();

  const sidebarWidthClass = collapsed ? "w-[6.75rem]" : "w-64";
  const alignContentClass = collapsed ? "justify-center" : "justify-start";

  // Manter scroll persistente e rolar para item ativo
  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      const navElement = navRef.current;
      const activeElement = activeItemRef.current;
      
      // Calcular posição para centralizar o item ativo
      const navRect = navElement.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      const scrollTop = activeElement.offsetTop - (navRect.height / 2) + (activeRect.height / 2);
      
      // Scroll suave para o item ativo
      navElement.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [location.pathname]);

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
      className={`hidden lg:flex flex-col shrink-0 ${sidebarWidthClass} p-5 gap-3 sticky top-0 h-screen overflow-hidden transition-all duration-300 ease-in-out`}
    >
      <div className={`flex items-center gap-3 px-2 py-3 mb-2 transition-all duration-300 ${alignContentClass}`}>
        <img src="/assets/loading-carcontrol-coelho.gif" alt="DashiDrive Logo" className="w-14 h-14 object-contain p-1 transition-all duration-300" />
        <div className={`${collapsed ? "hidden" : "block"} transition-opacity duration-300`}>
          <div className="font-display font-bold text-lg leading-none">DashiDrive</div>
          <div className="text-[11px] text-muted-foreground tracking-wide uppercase mt-1">Gestão de frotas</div>
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

      <nav 
        ref={navRef}
        className="flex flex-col gap-2 transition-all duration-300 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent hover:scrollbar-thumb-primary/80"
      >
        {items.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            ref={(el) => {
              // Atribuir ref ao item ativo
              const isActive = end 
                ? location.pathname === to 
                : location.pathname.startsWith(to);
              if (isActive && el) {
                activeItemRef.current = el;
              }
            }}
            className={({ isActive }) =>
              `group flex items-center gap-3 ${alignContentClass} px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300
              ${isActive ? "neu-press text-foreground" : "text-muted-foreground hover:text-foreground hover:neu-sm"}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? {
                    y: [0, -8, 0],
                  } : {
                    y: 0
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    repeat: isActive ? Infinity : 0,
                    repeatDelay: 3,
                  }}
                >
                  {icon}
                </motion.div>
                <span className={`${collapsed ? "hidden" : "block"} transition-opacity duration-300`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={`mt-auto neu p-4 transition-all duration-300 ${collapsed ? "px-2 py-3" : "p-4"}`}>
        <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? "flex-col" : "justify-between"}`}>
          <NavLink 
            to="/perfil"
            className={({ isActive }) => 
              `flex items-center gap-3 transition-all duration-300 hover:opacity-80 ${collapsed ? "flex-col" : ""} ${isActive ? "text-primary" : ""}`
            }
          >
            <div className="w-10 h-10 rounded-full bg-foreground text-background grid place-items-center font-semibold text-sm shrink-0 uppercase">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate max-w-[120px]">{userName}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{userRole}</div>
              </div>
            )}
          </NavLink>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sair da conta"
            className={`neu-sm hover:text-danger text-muted-foreground transition-all duration-300 flex items-center justify-center gap-2 rounded-2xl ${collapsed ? "w-10 h-10" : "px-3 py-2"}`}
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm font-medium"></span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
