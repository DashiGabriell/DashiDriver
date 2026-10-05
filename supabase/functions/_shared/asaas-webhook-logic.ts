/** Pure Asaas webhook helpers for Edge Functions. Mirror: src/lib/billing/asaasWebhookLogic.ts */

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

export function resolveWebhookAction(event: string): WebhookAction {
  if (ACTIVATE_EVENTS.has(event)) return "activate";
  if (DEACTIVATE_EVENTS.has(event)) return "deactivate";
  return "ignore";
}
