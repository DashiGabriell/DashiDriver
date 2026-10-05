import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, CreditCard, Ticket,
  MoreHorizontal, X,
  Car, BarChart3, FileText, Database, Flag, MessageSquare,
  Zap, Package, PhoneCall, Megaphone, Settings, Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { name: "Overview", path: "/dev", icon: LayoutDashboard },
  { name: "Empresas", path: "/dev/companies", icon: Building2 },
  { name: "Usuários", path: "/dev/users", icon: Users },
  { name: "Assinaturas", path: "/dev/billing", icon: CreditCard },
  { name: "Cupons", path: "/dev/coupons", icon: Ticket },
];

const secondaryItems = [
  { name: "Veículos", path: "/dev/veiculos", icon: Car },
  { name: "Analytics", path: "/dev/analytics", icon: BarChart3 },
  { name: "Logs", path: "/dev/logs", icon: FileText },
  { name: "Sistema", path: "/dev/system", icon: Database },
  { name: "Feature Flags", path: "/dev/features", icon: Flag },
  { name: "Migrations", path: "/dev/migrations", icon: Database },
  { name: "Suporte", path: "/dev/support", icon: MessageSquare },
  { name: "Eventos", path: "/dev/events", icon: Zap },
  { name: "Planos", path: "/dev/plans", icon: Package },
  { name: "WhatsApp", path: "/dev/whatsapp", icon: PhoneCall },
  { name: "Webhooks", path: "/dev/webhooks", icon: Webhook },
  { name: "Broadcast", path: "/dev/broadcast", icon: Megaphone },
  { name: "Configurações", path: "/dev/settings", icon: Settings },
];

interface DevMobileBottomNavProps {
  onOpenSidebar: () => void;
}

export function DevMobileBottomNav({ onOpenSidebar }: DevMobileBottomNavProps) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-border z-50 flex items-center justify-around px-2 pb-safe-bottom">
        {primaryItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 w-14"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                  isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 w-14"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground leading-tight">
            Mais
          </span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col" onClick={() => setDrawerOpen(false)}>
          <div className="flex-1 bg-black/50" />
          <div
            className="bg-background border-t border-border rounded-t-2xl max-h-[70vh] overflow-y-auto pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b border-border flex items-center justify-between px-4 py-3 rounded-t-2xl">
              <span className="font-semibold text-sm">Todas as páginas</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-4 gap-2">
              {[...primaryItems, ...secondaryItems].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-colors",
                      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
