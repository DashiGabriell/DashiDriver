import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertCard from "@/components/mobile/alertas/AlertCard";
import { useNotifications } from "@/hooks/useNotifications";
import { AppNotification, NotificationCategory } from "@/integrations/supabase/services/notificationService";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";

type AlertFilter = "todos" | "critico" | "manutencao" | "pagamento";

const filterLabels: Record<AlertFilter, string> = {
  todos: "Todos",
  critico: "Criticos",
  manutencao: "Manutencao",
  pagamento: "Pagamento",
};

const categoryToTipo: Partial<Record<NotificationCategory, "inadimplencia" | "manutencao" | "seguro" | "documentacao">> = {
  payment_overdue: "inadimplencia",
  insurance_expiring: "seguro",
  maintenance_overdue: "manutencao",
  damage_registered: "documentacao",
  payment_confirmed: "inadimplencia",
  vehicle_returned: "documentacao",
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

const getSeverity = (notification: AppNotification): "critica" | "alta" | "media" => {
  if (notification.type === "critical") return "critica";
  if (!notification.read) return "alta";
  return "media";
};

const matchesFilter = (notification: AppNotification, filter: AlertFilter) => {
  if (filter === "critico") return notification.type === "critical";
  if (filter === "manutencao") return notification.category === "maintenance_overdue";
  if (filter === "pagamento") {
    return notification.category === "payment_overdue" || notification.category === "payment_confirmed";
  }

  return true;
};

const MobileAlertas = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<AlertFilter>("todos");
  const {
    notifications,
    unreadTotalCount,
    isLoading,
    error,
    markAsRead,
  } = useNotifications();

  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => matchesFilter(notification, filter)),
    [filter, notifications]
  );

  const handleResolve = async (notification: AppNotification) => {
    await markAsRead(notification.id);
    toast.success(`Notificacao "${notification.title}" marcada como lida.`);
  };

  const handleAction = async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-6 flex items-center justify-between px-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Central de Alertas</h2>
          <p className="text-xs font-medium text-muted-foreground">
            {isLoading
              ? "Carregando..."
              : `${unreadTotalCount} ${unreadTotalCount === 1 ? "notificacao pendente" : "notificacoes pendentes"}`}
          </p>
        </div>
        <div className="neu-sm animate-pulse-soft rounded-2xl p-3 text-accent">
          <BellRing className="h-6 w-6" />
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto px-2 pb-2 scrollbar-none">
        {(Object.keys(filterLabels) as AlertFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`chip whitespace-nowrap rounded-2xl px-6 py-2.5 transition-all ${
              filter === option ? "bg-accent font-bold text-accent-foreground shadow-neu-sm" : ""
            }`}
          >
            {filterLabels[option]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && (
          <p className="neu rounded-2xl bg-danger/5 p-4 text-danger">
            Erro ao carregar notificacoes.
          </p>
        )}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="neu rounded-[32px] py-20 text-center text-muted-foreground">
            Nenhuma notificacao encontrada.
          </div>
        )}
        {filteredNotifications.map((notification) => (
          <AlertCard
            key={notification.id}
            tipo={categoryToTipo[notification.category] ?? "inadimplencia"}
            severidade={getSeverity(notification)}
            titulo={notification.title}
            mensagem={notification.message}
            timestamp={formatRelativeDate(notification.created_at)}
            onResolve={() => handleResolve(notification)}
            onAction={notification.action_url ? () => handleAction(notification) : undefined}
            actionLabel="Abrir notificacao"
            resolvedLabel={notification.read ? "Lida" : "Marcar lida"}
          />
        ))}
      </div>

      <div className="neu mt-10 rounded-[32px] border border-accent/20 bg-accent/5 p-6">
        <h5 className="mb-2 text-sm font-bold uppercase tracking-widest text-accent">Dica Operacional</h5>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Notificacoes criticas devem ser tratadas rapidamente para evitar prejuizos na operacao da frota.
        </p>
      </div>
    </div>
  );
};

export default MobileAlertas;
