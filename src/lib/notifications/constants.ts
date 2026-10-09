export const NotificationTypes = {
  CRITICAL: "critical",
  OPERATIONAL: "operational",
} as const;

export const NotificationCategories = {
  PAYMENT_OVERDUE: "payment_overdue",
  INSURANCE_EXPIRING: "insurance_expiring",
  MAINTENANCE_OVERDUE: "maintenance_overdue",
  DAMAGE_REGISTERED: "damage_registered",
  PAYMENT_CONFIRMED: "payment_confirmed",
  VEHICLE_RETURNED: "vehicle_returned",
  PLAN_EXPIRING: "plan_expiring",
  KM_LIMIT_EXCEEDED: "km_limit_exceeded",
  SYSTEM_BROADCAST: "system_broadcast",
} as const;

export const NotificationLabels = {
  payment_overdue: "Pagamento atrasado",
  insurance_expiring: "Seguro vencendo",
  maintenance_overdue: "Manutencao vencida",
  damage_registered: "Dano registrado",
  payment_confirmed: "Pagamento confirmado",
  vehicle_returned: "Veiculo devolvido",
  plan_expiring: "Plano proximo do vencimento",
  km_limit_exceeded: "Limite semanal de KM excedido",
  system_broadcast: "Aviso do sistema",
} as const;

export const CRITICAL_NOTIFICATION_CATEGORIES = [
  NotificationCategories.PAYMENT_OVERDUE,
  NotificationCategories.INSURANCE_EXPIRING,
  NotificationCategories.MAINTENANCE_OVERDUE,
  NotificationCategories.DAMAGE_REGISTERED,
  NotificationCategories.KM_LIMIT_EXCEEDED,
] as const;

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const MAX_NOTIFICATIONS_PER_FETCH = 100;
