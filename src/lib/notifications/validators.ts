import type { NotificationCategory, NotificationEntityType, NotificationType } from "@/integrations/supabase/services/notificationService";

const validTypes = new Set<NotificationType>(["critical", "operational"]);
const validCategories = new Set<NotificationCategory>([
  "payment_overdue",
  "insurance_expiring",
  "maintenance_overdue",
  "damage_registered",
  "payment_confirmed",
  "vehicle_returned",
  "plan_expiring",
  "km_limit_exceeded",
  "system_broadcast",
]);
const validEntityTypes = new Set<NotificationEntityType>([
  "veiculo",
  "pagamento",
  "manutencao",
  "motorista",
  "checklist",
]);

export function isValidNotificationType(type: string): type is NotificationType {
  return validTypes.has(type as NotificationType);
}

export function isValidNotificationCategory(category: string): category is NotificationCategory {
  return validCategories.has(category as NotificationCategory);
}

export function isValidNotificationEntityType(entityType: string | null | undefined): entityType is NotificationEntityType {
  return !entityType || validEntityTypes.has(entityType as NotificationEntityType);
}

export function buildNotificationDedupeKey(
  category: NotificationCategory,
  relatedEntityId?: string | null,
  suffix?: string | null
) {
  return [category, relatedEntityId, suffix].filter(Boolean).join(":") || null;
}
