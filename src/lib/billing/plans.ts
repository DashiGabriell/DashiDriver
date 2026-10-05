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

export type GestaoPlanSlug = "gestao-basico" | "gestao-pro" | "gestao-master";

/** Planos de gestão como aparecem na landing, em /planos e no resumo do checkout. */
export const GESTAO_PLANS: ReadonlyArray<{
  slug: GestaoPlanSlug;
  name: string;
  price: number;
  cars: number;
  drivers: number;
  users: string;
}> = [
  { slug: "gestao-basico", name: SAAS_PLAN_LABELS.BASICO, price: PLAN_CATALOG["gestao-basico"].price, cars: SAAS_PLAN_LIMITS.BASICO.veiculos, drivers: SAAS_PLAN_LIMITS.BASICO.motoristas, users: "1 usuário" },
  { slug: "gestao-pro", name: SAAS_PLAN_LABELS.PRO, price: PLAN_CATALOG["gestao-pro"].price, cars: SAAS_PLAN_LIMITS.PRO.veiculos, drivers: SAAS_PLAN_LIMITS.PRO.motoristas, users: "até 3 usuários" },
  { slug: "gestao-master", name: SAAS_PLAN_LABELS.MASTER, price: PLAN_CATALOG["gestao-master"].price, cars: SAAS_PLAN_LIMITS.MASTER.veiculos, drivers: SAAS_PLAN_LIMITS.MASTER.motoristas, users: "até 200 usuários" },
];

/** Linhas do resumo do pedido para cada plano vendável no checkout. */
export function planSummaryFor(slug: PlanSlug): { name: string; rows: Array<[string, string]> } {
  const gestao = GESTAO_PLANS.find((p) => p.slug === slug);
  if (gestao) {
    return {
      name: gestao.name,
      rows: [
        ["Carros", `até ${gestao.cars}`],
        ["Motoristas", `até ${gestao.drivers}`],
        ["Equipe", gestao.users],
      ],
    };
  }
  const mkt = slug === "marketplace-elite" ? "ELITE" : slug === "marketplace-pro" ? "PRO" : "FREE";
  return {
    name: `Marketplace ${mkt === "ELITE" ? "Elite" : mkt === "PRO" ? "Pro" : "Free"}`,
    rows: [["Anúncios ativos", `até ${MKT_PLAN_LIMITS[mkt].listings}`]],
  };
}

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
