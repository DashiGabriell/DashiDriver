import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2, Trash2 } from "lucide-react";

const Alertas = () => {
  const {
    critical,
    operational,
    unreadCriticalCount,
    unreadOperationalCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotifications();

  const renderList = (items: typeof critical) => {
    if (!items.length) {
      return (
        <div className="neu p-10 text-center font-display text-muted-foreground">
          Nenhuma notificacao encontrada.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar
        title="Alertas"
        subtitle="Notificacoes criticas e eventos operacionais da sua empresa"
        helpPath="/ajuda/gestao/alertas"
      />

      {error && (
        <div className="neu mb-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Erro ao carregar notificacoes.
        </div>
      )}

      <div className="neu p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Central de alertas</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCriticalCount + unreadOperationalCount} notificacao
              {unreadCriticalCount + unreadOperationalCount === 1 ? "" : "es"} nao lida
              {unreadCriticalCount + unreadOperationalCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={unreadCriticalCount + unreadOperationalCount === 0}
              onClick={() => markAllAsRead(undefined)}
            >
              Marcar todas como lidas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-danger"
              disabled={critical.length + operational.length === 0}
              onClick={() => deleteAll(undefined)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Limpar todas
            </Button>
          </div>
        </div>

        <Tabs defaultValue="critical">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="critical">
              Criticas
              {unreadCriticalCount > 0 && (
                <span className="ml-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">
                  {unreadCriticalCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="operational">
              Operacionais
              {unreadOperationalCount > 0 && (
                <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">
                  {unreadOperationalCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="critical" className="mt-4">
            {renderList(critical)}
          </TabsContent>
          <TabsContent value="operational" className="mt-4">
            {renderList(operational)}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Alertas;
