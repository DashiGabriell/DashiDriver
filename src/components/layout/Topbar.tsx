import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

export const Topbar = ({
  title,
  subtitle,
  onCreate,
  createLabel = "Novo registro",
  helpPath,
}: {
  title: ReactNode;
  subtitle?: string;
  onCreate?: () => void;
  createLabel?: string;
  helpPath?: string;
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const helpButton = helpPath ? (
    <button
      type="button"
      onClick={() => navigate(helpPath)}
      className="neu-sm h-8 w-8 grid place-items-center rounded-full text-muted-foreground/50 hover:text-foreground hover:opacity-100 transition-all"
      aria-label="Ajuda"
      title="Ajuda"
    >
      <img src="/assets/question.png" alt="Ajuda" className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <header className="flex items-center gap-3 mb-6 md:mb-8 animate-blur-in">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1 text-xs md:text-sm line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>

      <div className="ml-auto hidden lg:flex items-center gap-3">
        <GlobalSearch />
        {helpButton}
        <NotificationBell />
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="neu-interactive flex items-center gap-2 px-4 py-2.5 text-sm font-medium touch-target"
          >
            <Plus className="w-4 h-4" />
            {createLabel}
          </button>
        )}
      </div>

      {isMobile && (
        <div className="flex shrink-0 items-center gap-2">
          {helpButton}
          <NotificationBell />
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="neu-interactive p-3 grid place-items-center touch-target-lg"
              aria-label={createLabel}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
