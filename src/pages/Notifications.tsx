import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";

export default function Notifications() {
  const {
    critical,
    operational,
    unreadCriticalCount,
    unreadOperationalCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const renderList = (items: typeof critical) => {
    if (!items.length) {
      return (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
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

  return (
    <AppShell>
      <Topbar
        title="Notificacoes"
        subtitle="Alertas criticos e eventos operacionais da sua empresa"
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Central de notificacoes</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead(undefined)}
          >
            Marcar todas como lidas
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </AppShell>
  );
}
