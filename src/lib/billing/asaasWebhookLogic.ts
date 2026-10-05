/**
 * Pure Asaas webhook decision helpers (Epic 12).
 * Keep in sync with supabase/functions/asaas-webhook/index.ts planDef + event branches.
 */

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

const ACTIVATE_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);
const DEACTIVATE_EVENTS = new Set([
  "PAYMENT_OVERDUE",
  "SUBSCRIPTION_CANCELED",
  "PAYMENT_FAILED",
]);

/** Map Asaas event → business action. Replays of the same event stay the same action (idempotent intent). */
export function resolveWebhookAction(event: string): WebhookAction {
  if (ACTIVATE_EVENTS.has(event)) return "activate";
  if (DEACTIVATE_EVENTS.has(event)) return "deactivate";
  return "ignore";
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
    return {
      status: "APPROVED",
      asaas_payment_id: paymentId ?? null,
      paid_at: paidAtIso,
    };
  }
  if (action === "deactivate") {
    return {
      status: "REJECTED",
      asaas_payment_id: paymentId ?? null,
    };
  }
  return null;
}
