import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import {
  AppNotification,
  NotificationType,
  notificationService,
} from "@/integrations/supabase/services/notificationService";
import { NOTIFICATIONS_QUERY_KEY } from "@/lib/notifications/constants";

function createChannelId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelIdRef = useRef<string | null>(null);
  if (!channelIdRef.current) {
    channelIdRef.current = createChannelId();
  }
  const queryKey = useMemo(() => [...NOTIFICATIONS_QUERY_KEY, user?.id], [user?.id]);

  const query = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async () => {
      await notificationService.refreshCurrentUser();
      return notificationService.list();
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}:${channelIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.setQueryData<AppNotification[]>(queryKey, (current = []) => {
            if (payload.eventType === "INSERT") {
              const inserted = payload.new as AppNotification;
              if (inserted.user_id !== user.id) return current;
              const withoutDuplicate = current.filter((item) => item.id !== inserted.id);
              return [inserted, ...withoutDuplicate];
            }

            if (payload.eventType === "UPDATE") {
              const updated = payload.new as AppNotification;
              return current.map((item) => (item.id === updated.id ? updated : item));
            }

            if (payload.eventType === "DELETE") {
              const deleted = payload.old as Pick<AppNotification, "id">;
              return current.filter((item) => item.id !== deleted.id);
            }

            return current;
          });

          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, queryKey, user?.id]);

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: (type?: NotificationType) => notificationService.markAllAsRead(type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const notifications = (query.data || []) as AppNotification[];

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
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    isMutating:
      markAsReadMutation.isPending ||
      markAllAsReadMutation.isPending ||
      deleteMutation.isPending,
    ...grouped,
  };
}
