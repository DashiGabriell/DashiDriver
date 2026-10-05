import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const {
    critical,
    operational,
    unreadCriticalCount,
    unreadOperationalCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const renderList = (items: typeof critical) => {
    if (isLoading) {
      return (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhuma notificacao por aqui.
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Notificacoes</SheetTitle>
          <SheetDescription>
            Alertas criticos e eventos operacionais da sua empresa.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="critical" className="flex min-h-0 flex-1 flex-col px-6 pb-6">
          <div className="flex items-center justify-between gap-3 py-4">
            <TabsList className="grid w-full grid-cols-2">
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
          </div>

          <ScrollArea className="min-h-0 flex-1 pr-3">
            <TabsContent value="critical" className="mt-0 space-y-3">
              {unreadCriticalCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => markAllAsRead("critical")}
                >
                  Marcar criticas como lidas
                </Button>
              )}
              {renderList(critical)}
            </TabsContent>

            <TabsContent value="operational" className="mt-0 space-y-3">
              {unreadOperationalCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => markAllAsRead("operational")}
                >
                  Marcar operacionais como lidas
                </Button>
              )}
              {renderList(operational)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
