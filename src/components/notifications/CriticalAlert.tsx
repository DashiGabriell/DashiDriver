import { AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

export function CriticalAlert() {
  const navigate = useNavigate();
  const { latestUnreadCritical, markAsRead } = useNotifications();

  if (!latestUnreadCritical) return null;

  const openAction = async () => {
    await markAsRead(latestUnreadCritical.id);
    if (latestUnreadCritical.action_url) {
      navigate(latestUnreadCritical.action_url);
    }
  };

  return (
    <section className="mb-4 flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-950 shadow-sm dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-red-600 text-white">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{latestUnreadCritical.title}</h2>
          <p className="text-sm opacity-80">{latestUnreadCritical.message}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {latestUnreadCritical.action_url && (
          <Button type="button" size="sm" onClick={openAction}>
            Abrir
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          aria-label="Marcar alerta como lido"
          onClick={() => markAsRead(latestUnreadCritical.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
