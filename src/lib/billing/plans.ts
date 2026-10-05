/**
 * Plan limits by product (Epic 14).
 * Core = gestão (saas_plan). Satellite = marketplace (mkt_plan).
 * Asaas webhook remains platform — see asaasWebhookLogic.ts.
 */

/** Core — gestão SaaS */
export type SaasPlanId = "BASICO" | "PRO" | "MASTER";

export const SAAS_PLAN_LABELS: Record<SaasPlanId, string> = {
  BASICO: "Básico",
  PRO: "Pro",
  MASTER: "Master",
};

export const SAAS_PLAN_LIMITS: Record<
  SaasPlanId,
  { veiculos: number; motoristas: number }
> = {
  BASICO: { veiculos: 5, motoristas: 10 },
  PRO: { veiculos: 20, motoristas: 40 },
  MASTER: { veiculos: 100, motoristas: 200 },
};

/** Satellite — marketplace */
export const MKT_PLAN_LIMITS = {
  FREE: { listings: 1 },
  PRO: { listings: 10 },
  ELITE: { listings: 25 },
} as const;

export type MktPlan = keyof typeof MKT_PLAN_LIMITS;

/**
 * Catálogo de planos vendáveis (slug usado em /checkout/:plano).
 * Preço só para exibição: o valor cobrado vem de PLAN_PRICES em supabase/functions/process-payment.
 */
export const PLAN_CATALOG = {
  "gestao-basico": { title: "Plano Gestão Básico", price: 199, planType: "gestao" },
  "gestao-pro": { title: "Plano Gestão Pro", price: 399, planType: "gestao" },
  "gestao-master": { title: "Plano Gestão Master", price: 799, planType: "gestao" },
  "marketplace-free": { title: "Plano Marketplace Free", price: 0, planType: "marketplace" },
  "marketplace-pro": { title: "Plano Marketplace Pro", price: 119, planType: "marketplace" },
  "marketplace-elite": { title: "Plano Marketplace Elite", price: 299, planType: "marketplace" },
} as const satisfies Record<string, { title: string; price: number; planType: "gestao" | "marketplace" }>;

export type PlanSlug = keyof typeof PLAN_CATALOG;

export function isPlanSlug(slug: string | undefined): slug is PlanSlug {
  return !!slug && Object.prototype.hasOwnProperty.call(PLAN_CATALOG, slug);
}

export function saasLimitsFor(plan: string | null | undefined) {
  const key = (plan || "BASICO") as SaasPlanId;
  return SAAS_PLAN_LIMITS[key] ?? SAAS_PLAN_LIMITS.BASICO;
}

export function saasLabelFor(plan: string | null | undefined) {
  const key = (plan || "BASICO") as SaasPlanId;
  return SAAS_PLAN_LABELS[key] ?? SAAS_PLAN_LABELS.BASICO;
}

export function mktListingLimitFor(plan: string | null | undefined) {
  const key = (plan || "FREE") as MktPlan;
  return MKT_PLAN_LIMITS[key]?.listings ?? MKT_PLAN_LIMITS.FREE.listings;
}
