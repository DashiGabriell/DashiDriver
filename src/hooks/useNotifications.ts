import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import {
  AppNotification,
  NotificationType,
  notificationService,
} from "@/integrations/supabase/services/notificationService";
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/notifications/constants";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// Compartilhado entre todas as instâncias do hook (sino, alerta crítico, central, /alertas).
const lastRefreshByUser = new Map<string, number>();
const inflightRefreshByUser = new Map<string, Promise<void>>();

async function refreshDerivedNotifications(userId: string, force = false) {
  const last = lastRefreshByUser.get(userId) ?? 0;
  if (!force && Date.now() - last < REFRESH_INTERVAL_MS) return;

  const inflight = inflightRefreshByUser.get(userId);
  if (inflight) return inflight;

  const promise = notificationService
    .refreshCurrentUser()
    .catch((error) => {
      console.warn("[notifications] refresh_user_notifications falhou", error);
    })
    .finally(() => {
      lastRefreshByUser.set(userId, Date.now());
      inflightRefreshByUser.delete(userId);
    });

  inflightRefreshByUser.set(userId, promise);
  return promise;
}

function createChannelId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const channelIdRef = useRef<string | null>(null);
  if (!channelIdRef.current) {
    channelIdRef.current = createChannelId();
  }
  const queryKey = useMemo(() => [...NOTIFICATIONS_QUERY_KEY, userId], [userId]);

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async () => {
      if (userId) await refreshDerivedNotifications(userId);
      return notificationService.list();
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}:${channelIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.setQueryData<AppNotification[]>(queryKey, (current = []) => {
            if (payload.eventType === "INSERT") {
              const inserted = payload.new as AppNotification;
              if (inserted.user_id !== userId || inserted.dismissed_at) return current;
              const withoutDuplicate = current.filter((item) => item.id !== inserted.id);
              return [inserted, ...withoutDuplicate];
            }

            if (payload.eventType === "UPDATE") {
              const updated = payload.new as AppNotification;
              if (updated.dismissed_at) {
                return current.filter((item) => item.id !== updated.id);
              }
              const exists = current.some((item) => item.id === updated.id);
              return exists
                ? current.map((item) => (item.id === updated.id ? updated : item))
                : current;
            }

            if (payload.eventType === "DELETE") {
              const deleted = payload.old as Pick<AppNotification, "id">;
              return current.filter((item) => item.id !== deleted.id);
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, queryKey, userId]);

  const applyOptimistic = useCallback(
    async (updater: (current: AppNotification[]) => AppNotification[]) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AppNotification[]>(queryKey);
      queryClient.setQueryData<AppNotification[]>(queryKey, (current = []) => updater(current));
      return { previous };
    },
    [queryClient, queryKey]
  );

  const rollback = useCallback(
    (context: { previous?: AppNotification[] } | undefined, message: string) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error(message);
    },
    [queryClient, queryKey]
  );

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: (id: string) =>
      applyOptimistic((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true, read_at: new Date().toISOString() } : item
        )
      ),
    onError: (_error, _id, context) => rollback(context, "Não foi possível marcar como lida."),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: (type?: NotificationType) => notificationService.markAllAsRead(type),
    onMutate: (type?: NotificationType) =>
      applyOptimistic((current) =>
        current.map((item) =>
          !type || item.type === type
            ? { ...item, read: true, read_at: item.read_at ?? new Date().toISOString() }
            : item
        )
      ),
    onError: (_error, _type, context) =>
      rollback(context, "Não foi possível marcar as notificações como lidas."),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onMutate: (id: string) => applyOptimistic((current) => current.filter((item) => item.id !== id)),
    onError: (_error, _id, context) => rollback(context, "Não foi possível excluir a notificação."),
  });

  const deleteAllMutation = useMutation({
    mutationFn: (type?: NotificationType) => notificationService.deleteAll(type),
    onMutate: (type?: NotificationType) =>
      applyOptimistic((current) => current.filter((item) => type && item.type !== type)),
    onError: (_error, _type, context) =>
      rollback(context, "Não foi possível excluir as notificações."),
  });

  const swallow =
    <T,>(fn: (arg: T) => Promise<unknown>) =>
    async (arg: T) => {
      try {
        await fn(arg);
      } catch {
        // erro já tratado no onError da mutation (rollback + toast)
      }
    };

  const refetch = useCallback(async () => {
    if (userId) await refreshDerivedNotifications(userId, true);
    return query.refetch();
  }, [query, userId]);

  const notifications = useMemo(() => (query.data || []) as AppNotification[], [query.data]);

  const grouped = useMemo(() => {
    const critical = notifications.filter((item) => item.type === "critical");
    const operational = notifications.filter((item) => item.type === "operational");
    const unread = notifications.filter((item) => !item.read);

    return {
      critical,
      operational,
      unread,
      unreadCriticalCount: critical.filter((item) => !item.read).length,
      unreadOperationalCount: operational.filter((item) => !item.read).length,
      unreadTotalCount: unread.length,
      latestUnreadCritical: critical.find((item) => !item.read) ?? null,
    };
  }, [notifications]);

  return {
    notifications,
    isLoading: query.isLoading,
    error: query.error,
    refetch,
    markAsRead: swallow(markAsReadMutation.mutateAsync),
    markAllAsRead: swallow(markAllAsReadMutation.mutateAsync),
    deleteNotification: swallow(deleteMutation.mutateAsync),
    deleteAll: swallow(deleteAllMutation.mutateAsync),
    isMutating:
      markAsReadMutation.isPending ||
      markAllAsReadMutation.isPending ||
      deleteMutation.isPending ||
      deleteAllMutation.isPending,
    ...grouped,
  };
}
