import { supabase } from "@/integrations/supabase/client";
import { MAX_NOTIFICATIONS_PER_FETCH } from "@/lib/notifications/constants";
import { buildNotificationDedupeKey } from "@/lib/notifications/validators";

export type NotificationType = "critical" | "operational";
export type NotificationCategory =
  | "payment_overdue"
  | "insurance_expiring"
  | "maintenance_overdue"
  | "damage_registered"
  | "payment_confirmed"
  | "vehicle_returned"
  | "plan_expiring"
  | "km_limit_exceeded";
export type NotificationEntityType =
  | "veiculo"
  | "pagamento"
  | "manutencao"
  | "motorista"
  | "checklist";

export interface AppNotification {
  id: string;
  company_id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  action_url: string | null;
  related_entity_type: NotificationEntityType | null;
  related_entity_id: string | null;
  dedupe_key: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  companyId: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  relatedEntity?: {
    type: NotificationEntityType;
    id: string;
  };
  dedupeSuffix?: string;
  metadata?: Record<string, unknown>;
}

const notificationsTable = () => (supabase as any).from("notifications");

export const notificationService = {
  async refreshCurrentUser() {
    const { error } = await (supabase as any).rpc("refresh_user_notifications");
    if (error) throw error;
  },

  async list(limit = MAX_NOTIFICATIONS_PER_FETCH): Promise<AppNotification[]> {
    const { data, error } = await notificationsTable()
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AppNotification[];
  },

  async createNotification(input: CreateNotificationInput): Promise<AppNotification> {
    const dedupeKey = buildNotificationDedupeKey(
      input.category,
      input.relatedEntity?.id,
      input.dedupeSuffix
    );

    const { data, error } = await notificationsTable()
      .insert({
        company_id: input.companyId,
        user_id: input.userId,
        type: input.type,
        category: input.category,
        title: input.title,
        message: input.message,
        action_url: input.actionUrl ?? null,
        related_entity_type: input.relatedEntity?.type ?? null,
        related_entity_id: input.relatedEntity?.id ?? null,
        dedupe_key: dedupeKey,
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as AppNotification;
  },

  async markAsRead(notificationId: string) {
    const { error } = await notificationsTable()
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) throw error;
  },

  async markAllAsRead(type?: NotificationType) {
    let query = notificationsTable()
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("read", false);

    if (type) {
      query = query.eq("type", type);
    }

    const { error } = await query;
    if (error) throw error;
  },

  async deleteNotification(notificationId: string) {
    const { error } = await notificationsTable().delete().eq("id", notificationId);
    if (error) throw error;
  },
};
