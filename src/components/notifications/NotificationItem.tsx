import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  FileWarning,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNotification } from "@/integrations/supabase/services/notificationService";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const categoryIcon: Record<string, ComponentType<{ className?: string }>> = {
  payment_overdue: CreditCard,
  insurance_expiring: Clock,
  maintenance_overdue: AlertTriangle,
  damage_registered: FileWarning,
  payment_confirmed: CheckCircle2,
  vehicle_returned: Car,
  plan_expiring: Clock,
  km_limit_exceeded: Car,
};

function formatRelativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `ha ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `ha ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `ha ${diffDays} d`;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = categoryIcon[notification.category] ?? AlertTriangle;
  const isCritical = notification.type === "critical";

  const openAction = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
    if (notification.category === "payment_confirmed") {
      navigate("/pagamentos?tab=confirmados");
    } else if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <article
      className={cn(
        "flex gap-3 rounded-md border p-3 transition-colors",
        !notification.read && "bg-muted/40",
        isCritical ? "border-red-200 dark:border-red-900/50" : "border-border"
      )}
    >
      <div
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-md",
          isCritical ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{notification.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
          </div>
          <Badge
            variant={isCritical ? "destructive" : "secondary"}
            className="shrink-0"
          >
            {isCritical ? "Critica" : "Operacional"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(notification.created_at)}
          </span>
          {!notification.read && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onMarkAsRead(notification.id)}
            >
              Marcar lida
            </Button>
          )}
          {(notification.action_url || notification.category === "payment_confirmed") && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={openAction}
            >
              Abrir
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="ml-auto h-7 w-7 p-0 text-muted-foreground"
            aria-label="Excluir notificacao"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
