/** Pure Asaas billing helpers for Edge Functions. Mirror: src/lib/billing/asaasWebhookLogic.ts */

export type PlanDef = {
  type: "gestao" | "marketplace";
  saasPlan?: "BASICO" | "PRO" | "MASTER";
  mktPlan?: "FREE" | "PRO" | "ELITE";
};

export type WebhookAction = "activate" | "deactivate" | "ignore";

export function planDef(slug: string): PlanDef {
  const key = String(slug || "").toLowerCase();
  if (key === "gestao-basico") return { type: "gestao", saasPlan: "BASICO" };
  if (key === "gestao-pro") return { type: "gestao", saasPlan: "PRO" };
  if (key === "gestao-master") return { type: "gestao", saasPlan: "MASTER" };
  if (key === "marketplace-free") return { type: "marketplace", mktPlan: "FREE" };
  if (key === "marketplace-pro") return { type: "marketplace", mktPlan: "PRO" };
  if (key === "marketplace-elite") return { type: "marketplace", mktPlan: "ELITE" };
  throw new Error(`Plano invalido: ${slug}`);
}

export function planTypeOf(slug: string): PlanDef["type"] | null {
  try {
    return planDef(slug).type;
  } catch {
    return null;
  }
}

const ACTIVATE_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);
const DEACTIVATE_EVENTS = new Set([
  "PAYMENT_OVERDUE",
  "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
  "PAYMENT_FAILED",
  "SUBSCRIPTION_CANCELED",
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_INACTIVATED",
]);

export function resolveWebhookAction(event: string): WebhookAction {
  if (ACTIVATE_EVENTS.has(event)) return "activate";
  if (DEACTIVATE_EVENTS.has(event)) return "deactivate";
  return "ignore";
}

export const isSubscriptionEndedEvent = (event: string) =>
  event === "SUBSCRIPTION_CANCELED" || event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED";

/** Rows in these states were replaced by another checkout; their events must not touch access. */
export const CLOSED_PAYMENT_STATUSES = new Set(["CANCELED", "CANCELING"]);

/**
 * What to do with a never-paid (PENDING) row on a negative event.
 * Overdue first charge: the checkout was abandoned, so the subscription is cancelled at Asaas
 * to stop it from generating new charges every month.
 */
export function pendingRowOutcome(event: string): "cancel_remote" | "canceled" | "rejected" {
  if (isSubscriptionEndedEvent(event)) return "canceled";
  if (event === "PAYMENT_OVERDUE") return "cancel_remote";
  return "rejected";
}

/** Asaas sends `payment.subscription` (string) on PAYMENT_* and a `subscription` object on SUBSCRIPTION_*. */
export function extractSubscriptionId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as { payment?: { subscription?: unknown } | null; subscription?: unknown };
  const fromPayment = p.payment?.subscription;
  if (typeof fromPayment === "string" && fromPayment) return fromPayment;
  const sub = p.subscription;
  if (typeof sub === "string" && sub) return sub;
  if (sub && typeof sub === "object") {
    const id = (sub as { id?: unknown }).id;
    if (typeof id === "string" && id) return id;
  }
  return null;
}

function addOneMonth(base: Date): Date {
  const d = new Date(base.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

/**
 * Paid-through date after a confirmed charge: one month after the charge due date (or now),
 * never moving an existing later date backwards. Replays of the same charge yield the same date.
 */
export function nextExpiration(
  currentIso: string | null | undefined,
  dueDate: string | null | undefined,
  now: Date = new Date(),
): string {
  let base = now;
  if (dueDate) {
    const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? `${dueDate}T12:00:00.000Z` : dueDate);
    if (!Number.isNaN(parsed.getTime())) base = parsed;
  }
  const candidate = addOneMonth(base);
  const current = currentIso ? new Date(currentIso) : null;
  if (current && !Number.isNaN(current.getTime()) && current.getTime() > candidate.getTime()) {
    return current.toISOString();
  }
  return candidate.toISOString();
}

/** Same rule as src/lib/access/evaluateAccessControl.ts (`authorized`). */
export function hasActiveAccess(
  profile: { trial: string | null; created_at: string | null; status: string | null; plano_ativo: string | null } | null,
  companyAtivo: boolean,
  nowMs: number = Date.now(),
): boolean {
  if (companyAtivo) return true;
  if (!profile) return false;
  const trialStart = profile.created_at ? new Date(profile.created_at).getTime() : 0;
  const isTrial = profile.trial === "ativo" && nowMs < trialStart + 7 * 24 * 60 * 60 * 1000;
  return isTrial || (profile.status === "ativo" && !!profile.plano_ativo);
}

export type PaymentRowPatch = {
  status: "APPROVED" | "REJECTED";
  asaas_payment_id: string | null;
  paid_at?: string;
};

/** Desired payment row patch for an action — same input → same patch shape (replay-safe). */
export function paymentPatchForAction(
  action: WebhookAction,
  paymentId: string | null | undefined,
  paidAtIso: string,
): PaymentRowPatch | null {
  if (action === "activate") {
    return { status: "APPROVED", asaas_payment_id: paymentId ?? null, paid_at: paidAtIso };
  }
  if (action === "deactivate") {
    return { status: "REJECTED", asaas_payment_id: paymentId ?? null };
  }
  return null;
}
