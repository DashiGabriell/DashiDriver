import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, CreditCard, BarChart3,
  FileText, Flag, Database, MessageSquare, Zap,
  Package, PhoneCall, Car, Megaphone, Ticket, ChevronLeft, ChevronRight, X,
  ShieldAlert, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Overview", path: "/dev", icon: LayoutDashboard },
  { name: "Empresas", path: "/dev/companies", icon: Building2 },
  { name: "Usuários", path: "/dev/users", icon: Users },
  { name: "Veículos", path: "/dev/veiculos", icon: Car },
  { name: "Assinaturas", path: "/dev/billing", icon: CreditCard },
  { name: "Analytics", path: "/dev/analytics", icon: BarChart3 },
  { name: "Logs", path: "/dev/logs", icon: FileText },
  { name: "Sistema", path: "/dev/system", icon: Database },
  { name: "Segurança", path: "/dev/security", icon: ShieldAlert },
  { name: "Feature Flags", path: "/dev/features", icon: Flag },
  { name: "Suporte", path: "/dev/support", icon: MessageSquare },
  { name: "Eventos", path: "/dev/events", icon: Zap },
  { name: "Planos", path: "/dev/plans", icon: Package },
  { name: "WhatsApp", path: "/dev/whatsapp", icon: PhoneCall },
  { name: "Broadcast", path: "/dev/broadcast", icon: Megaphone },
  { name: "Cupons", path: "/dev/coupons", icon: Ticket },
  { name: "Chatbot", path: "/dev/chatbot", icon: Bot },
];

interface DevSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function DevSidebar({ sidebarOpen, onToggleSidebar }: DevSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (sidebarOpen) onToggleSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const sidebarContent = (
    <>
      {/* Logo + Toggle */}
      <div
        className={cn(
          "flex items-center mb-6",
          collapsed ? "flex-col gap-3" : "justify-between",
        )}
      >
        <img
          src="/assets/logo2.png"
          alt="DashiDrive"
          className={cn("object-contain", collapsed ? "w-8 h-8" : "h-8")}
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCollapsed((prev) => !prev); }}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.name : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              collapsed && "justify-center px-2",
              location.pathname === item.path
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && item.name}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex border-r border-border bg-card p-3 transition-all duration-300 flex-col",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" onClick={onToggleSidebar}>
          <aside
            className="w-64 bg-card border-r border-border p-3 flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <img src="/assets/logo2.png" alt="DashiDrive" className="h-8 object-contain" />
              <button
                onClick={onToggleSidebar}
                className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1 flex-1">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === item.path
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 bg-black/50" />
        </div>
      )}
    </>
  );
}
