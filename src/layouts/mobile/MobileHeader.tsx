import { useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export const MobileHeader = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const userName = session?.user?.user_metadata?.nome || session?.user?.email?.split("@")[0] || "Operador";

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-md sticky top-0 z-40 border-b border-border/10">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium">Ola, {userName}</span>
        <h1 className="text-lg font-bold tracking-tight">DashiDrive</h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell variant="mobile" />
        <button
          onClick={() => navigate("/mobile/perfil")}
          className="neu-sm w-10 h-10 rounded-full overflow-hidden border-2 border-accent/20 hover:border-accent/40 transition-colors"
        >
          <div className="w-full h-full bg-accent/10 flex items-center justify-center">
            <img
              src="/assets/perfil1.png"
              alt="Perfil"
              className="w-6 h-6 object-contain"
            />
          </div>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
