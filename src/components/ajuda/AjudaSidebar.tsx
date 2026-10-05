import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ShoppingBag,
  Users,
  Car,
  ClipboardCheck,
  Wallet,
  CreditCard,
  Wrench,
  TrendingUp,
  Bell,
  UserCog,
  User,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  PlusCircle,
  FileText,
  Search,
  Heart,
  MessageCircle,
  ListChecks,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCarcontrolUser } from "@/hooks/useCarcontrolUser";

const modules = [
  { name: "Gestão", path: "/ajuda/gestao", icon: BookOpen },
  { name: "Marketplace", path: "/ajuda/marketplace", icon: ShoppingBag },
];

const toolsPorModulo: Record<string, { name: string; path: string; icon: React.ElementType }[]> = {
  gestao: [
    { name: "Veículos", path: "/ajuda/gestao/veiculos", icon: Car },
    { name: "Motoristas", path: "/ajuda/gestao/motoristas", icon: Users },
    { name: "Checklists", path: "/ajuda/gestao/checklists", icon: ClipboardCheck },
    { name: "Pagamentos", path: "/ajuda/gestao/pagamentos", icon: Wallet },
    { name: "Financiamento & Seguro", path: "/ajuda/gestao/financiamento-seguro", icon: CreditCard },
    { name: "Manutenção", path: "/ajuda/gestao/manutencao", icon: Wrench },
    { name: "Lucratividade", path: "/ajuda/gestao/lucratividade", icon: TrendingUp },
    { name: "Alertas", path: "/ajuda/gestao/alertas", icon: Bell },
    { name: "Usuários", path: "/ajuda/gestao/usuarios", icon: UserCog },
    { name: "Perfil", path: "/ajuda/gestao/perfil", icon: User },
  ],
  marketplace: [
    { name: "Início", path: "/ajuda/marketplace/home", icon: LayoutDashboard },
    { name: "Buscar", path: "/ajuda/marketplace/buscar", icon: Search },
    { name: "Detalhes do Anúncio", path: "/ajuda/marketplace/detalhes", icon: FileText },
    { name: "Anunciar Veículo", path: "/ajuda/marketplace/anunciar", icon: PlusCircle },
    { name: "Favoritos", path: "/ajuda/marketplace/favoritos", icon: Heart },
    { name: "Perfil", path: "/ajuda/marketplace/perfil", icon: User },
    { name: "Meus Anúncios", path: "/ajuda/marketplace/meus-anuncios", icon: Package },
    { name: "Propostas", path: "/ajuda/marketplace/propostas", icon: MessageCircle },
    { name: "Inspeção", path: "/ajuda/marketplace/inspecao", icon: ClipboardCheck },
    { name: "Lista de Inspeções", path: "/ajuda/marketplace/lista-inspecoes", icon: ListChecks },
  ],
};

export function AjudaSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { profile, company, userRole } = useCarcontrolUser();

  const visibleModules = useMemo(
    () =>
      modules.filter((mod) => {
        if (userRole === "dev") return true;

        switch (mod.name) {
          case "Gestão":
            return !!company?.saas_plan;
          case "Marketplace":
            return !!company?.mkt_plan;
          default:
            return true;
        }
      }),
    [company, userRole],
  );

  useEffect(() => {
    const match = location.pathname.match(/\/ajuda\/(\w+)/);
    if (match) {
      const moduleName = modules.find(
        (m) => m.path === `/ajuda/${match[1]}`,
      )?.name;
      if (
        moduleName &&
        visibleModules.some((m) => m.name === moduleName)
      ) {
        setActiveModule(match[1]);
      } else {
        setActiveModule(null);
      }
    }
  }, [location.pathname, visibleModules]);

  const sidebarWidthClass = collapsed ? "w-[6.75rem]" : "w-64";

  return (
    <aside className={`${sidebarWidthClass} border-r border-border bg-card p-4 flex flex-col h-screen sticky top-0 overflow-y-auto transition-all duration-300 scrollbar-thin scrollbar-thumb-blue scrollbar-track-transparent hover:scrollbar-thumb-blue`}>
      {/* Logo area */}
      <div className={`flex items-center gap-3 mb-8 transition-all duration-300 ${collapsed ? "justify-center px-0" : "px-2"}`}>
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 grid place-items-center shrink-0">
          <LifeBuoy className="w-5 h-5 text-blue-600" />
        </div>
        <span className={`font-display text-lg font-bold transition-opacity duration-300 ${collapsed ? "hidden" : "block"}`}>
          Ajuda
        </span>
      </div>

      {/* Toggle button */}
      <div className={`flex items-center mb-4 transition-all duration-300 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        <span className={`text-[11px] font-semibold text-muted-foreground uppercase tracking-widest transition-opacity duration-300 ${collapsed ? "hidden" : "block"}`}>
          Módulos
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((state) => !state)}
          className="neu-sm h-7 w-7 grid place-items-center rounded-full text-muted-foreground transition-all duration-300 hover:text-foreground"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Module navigation */}
      <nav className="space-y-1 mb-6">
        {visibleModules.map((mod) => {
          const Icon = mod.icon;
          const isActive = location.pathname.startsWith(mod.path);
          return (
            <Link
              key={mod.path}
              to={mod.path}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-blue-500/10 text-blue-600"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? mod.name : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={`transition-opacity duration-300 ${collapsed ? "hidden" : "block"}`}>
                {mod.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Tools list */}
      {activeModule && toolsPorModulo[activeModule] && (
        <>
          <div className={`text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 transition-all duration-300 ${collapsed ? "text-center px-0" : "px-3"}`}>
            <span className={collapsed ? "hidden" : "block"}>Ferramentas</span>
          </div>
          <nav className="space-y-0.5">
            {toolsPorModulo[activeModule].map((tool) => {
              const ToolIcon = tool.icon;
              const isActive = location.pathname === tool.path;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg text-sm transition-colors",
                    collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={collapsed ? tool.name : undefined}
                >
                  <ToolIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className={`transition-opacity duration-300 ${collapsed ? "hidden" : "block"}`}>
                    {tool.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </aside>
  );
}
