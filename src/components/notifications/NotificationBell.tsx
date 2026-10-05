import { useState } from "react";
import { Bell } from "lucide-react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
  variant?: "topbar" | "mobile";
}

export function NotificationBell({ className, variant = "topbar" }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { unreadCriticalCount, unreadOperationalCount } = useNotifications();
  const total = unreadCriticalCount + unreadOperationalCount;
  const hasCritical = unreadCriticalCount > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative grid place-items-center transition-colors",
          variant === "topbar"
            ? "neu-interactive h-10 w-10 rounded-md"
            : "neu-sm h-10 w-10 rounded-full text-muted-foreground hover:text-foreground",
          hasCritical && "text-red-600",
          className
        )}
        title="Ver notificacoes"
        aria-label={`Ver notificacoes${total ? `, ${total} nao lidas` : ""}`}
      >
        <Bell className={cn("h-5 w-5", hasCritical && "animate-pulse")} />
        <NotificationBadge
          count={total}
          tone={hasCritical ? "critical" : "operational"}
        />
      </button>
      <NotificationCenter open={open} onOpenChange={setOpen} />
    </>
  );
}
