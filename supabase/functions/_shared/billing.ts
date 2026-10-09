import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSecretKey } from "./cors.ts";
import { nextExpiration, planDef, planTypeOf } from "./asaas-webhook-logic.ts";

/** Shared billing side effects for process-payment, check-payment-status and asaas-webhook. */

export function createAdminClient(): SupabaseClient {
  const key = getSecretKey();
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { apikey: key } },
  });
}

export type AsaasResult = { ok: boolean; status: number; data: any };

export function hasAsaasConfig(): boolean {
  return !!Deno.env.get("ASAAS_API_KEY") && !!Deno.env.get("ASAAS_BASE_URL");
}

/** Asaas call that keeps the HTTP method across redirects (fetch would turn POST into GET). */
export async function asaasRequest(
  path: string,
  init: { method?: "GET" | "POST" | "DELETE"; body?: unknown } = {},
): Promise<AsaasResult> {
  const apiKey = Deno.env.get("ASAAS_API_KEY");
  const baseUrl = Deno.env.get("ASAAS_BASE_URL");
  if (!apiKey || !baseUrl) throw new Error("Credenciais Asaas nao configuradas no servidor");

  const method = init.method ?? "GET";
  const options: RequestInit = {
    method,
    headers: { access_token: apiKey, "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    redirect: "manual",
  };

  let res = await fetch(`${baseUrl}${path}`, options);
  if (res.status >= 301 && res.status <= 308) {
    const location = res.headers.get("location");
    if (location) res = await fetch(location, options);
  }

  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  return { ok: res.ok, status: res.status, data };
}

export const asaasErrorMessage = (r: AsaasResult, fallback: string) =>
  r.data?.errors?.[0]?.description || `${fallback} (status ${r.status})`;

type PaymentRow = { id: string; plan: string; status: string; asaas_subscription_id: string | null };

/**
 * Cancels at Asaas and closes the given rows. A row is claimed as CANCELING first so the
 * SUBSCRIPTION_DELETED webhook that Asaas fires for it is ignored instead of revoking access.
 */
export async function cancelSubscriptionRows(admin: SupabaseClient, rows: PaymentRow[]): Promise<void> {
  for (const row of rows) {
    if (!row.asaas_subscription_id) continue;

    const { data: claimed, error: claimError } = await admin
      .from("payments")
      .update({ status: "CANCELING" })
      .eq("id", row.id)
      .eq("status", row.status)
      .select("id");
    if (claimError) throw new Error(`DB payments: ${claimError.message}`);
    if (!claimed?.length) continue;

    let finalStatus = row.status;
    try {
      const res = await asaasRequest(`/subscriptions/${row.asaas_subscription_id}`, { method: "DELETE" });
      if (res.ok || res.status === 404) finalStatus = "CANCELED";
      else console.error("Falha ao cancelar assinatura no Asaas", row.asaas_subscription_id, res.status);
    } catch (err) {
      console.error("Falha ao cancelar assinatura no Asaas", row.asaas_subscription_id, (err as Error)?.message);
    }

    await admin.from("payments").update({ status: finalStatus }).eq("id", row.id).eq("status", "CANCELING");
  }
}

/** Other subscriptions of the same plan type (gestao / marketplace) in the given states. */
export async function otherSubscriptionRows(
  admin: SupabaseClient,
  userId: string,
  planSlug: string,
  statuses: string[],
  keepSubscriptionId?: string | null,
): Promise<PaymentRow[]> {
  const type = planTypeOf(planSlug);
  const { data, error } = await admin
    .from("payments")
    .select("id, plan, status, asaas_subscription_id")
    .eq("user_id", userId)
    .in("status", statuses)
    .not("asaas_subscription_id", "is", null);
  if (error) throw new Error(`DB payments: ${error.message}`);
  return (data ?? []).filter(
    (r: PaymentRow) => r.asaas_subscription_id !== keepSubscriptionId && planTypeOf(r.plan) === type,
  );
}

/** Grants the plan after a confirmed charge and renews the paid-through date. Idempotent. */
export async function grantPlan(
  admin: SupabaseClient,
  userId: string,
  planSlug: string,
  dueDate: string | null,
): Promise<void> {
  const def = planDef(planSlug);

  const { data: profile, error: profileError } = await admin
    .from("carcontrol_profiles")
    .select("company_id, data_expiracao, status, plano_ativo")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw new Error(`DB carcontrol_profiles: ${profileError.message}`);

  // The profile holds a single plan: a marketplace purchase must not replace an active gestao plan there.
  const keepsGestaoProfile =
    def.type === "marketplace" && profile?.status === "ativo" && planTypeOf(profile?.plano_ativo ?? "") === "gestao";

  if (!keepsGestaoProfile) {
    const profileUpdate: Record<string, unknown> = {
      status: "ativo",
      plan: planSlug,
      plano_ativo: planSlug,
      trial: null,
      data_expiracao: planSlug === "marketplace-free" ? null : nextExpiration(profile?.data_expiracao ?? null, dueDate),
    };
    const { error: updateError } = await admin.from("carcontrol_profiles").update(profileUpdate).eq("id", userId);
    if (updateError) throw new Error(`DB carcontrol_profiles: ${updateError.message}`);
  }

  if (!profile?.company_id) return;

  const companyUpdate: Record<string, unknown> = { trial: null };
  if (def.type === "gestao") {
    companyUpdate.ativo = true;
    companyUpdate.saas_plan = def.saasPlan;
  } else {
    companyUpdate.mkt_plan = def.mktPlan;
  }
  const { error: companyError } = await admin
    .from("carcontrol_companies")
    .update(companyUpdate)
    .eq("id", profile.company_id);
  if (companyError) throw new Error(`DB carcontrol_companies: ${companyError.message}`);
}

/** Confirmed charge on a subscription: approve the row, grant the plan, cancel what it replaced. */
export async function confirmSubscriptionPayment(
  admin: SupabaseClient,
  args: { userId: string; subscriptionId: string; plan: string; asaasPaymentId: string | null; dueDate: string | null },
): Promise<void> {
  const { error } = await admin
    .from("payments")
    .update({ status: "APPROVED", asaas_payment_id: args.asaasPaymentId, paid_at: new Date().toISOString() })
    .eq("asaas_subscription_id", args.subscriptionId)
    .eq("user_id", args.userId)
    .not("status", "in", "(CANCELED,CANCELING)");
  if (error) throw new Error(`DB payments: ${error.message}`);

  await grantPlan(admin, args.userId, args.plan, args.dueDate);

  const replaced = await otherSubscriptionRows(
    admin,
    args.userId,
    args.plan,
    ["PENDING", "APPROVED", "REJECTED"],
    args.subscriptionId,
  );
  await cancelSubscriptionRows(admin, replaced);
}

/** True when this row is the user's latest paid subscription of its plan type. */
export async function isCurrentSubscription(admin: SupabaseClient, userId: string, row: PaymentRow): Promise<boolean> {
  const type = planTypeOf(row.plan);
  const { data, error } = await admin
    .from("payments")
    .select("id, plan")
    .eq("user_id", userId)
    .eq("status", "APPROVED")
    .not("asaas_subscription_id", "is", null)
    .order("paid_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`DB payments: ${error.message}`);
  const latest = (data ?? []).find((r: { plan: string }) => planTypeOf(r.plan) === type);
  return latest?.id === row.id;
}

export async function revokePlan(admin: SupabaseClient, userId: string, planSlug: string): Promise<void> {
  const def = planDef(planSlug);

  const { data: profile, error: profileError } = await admin
    .from("carcontrol_profiles")
    .select("company_id, plano_ativo")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw new Error(`DB carcontrol_profiles: ${profileError.message}`);

  if (profile?.plano_ativo === planSlug) {
    const { error } = await admin.from("carcontrol_profiles").update({ status: "inativo" }).eq("id", userId);
    if (error) throw new Error(`DB carcontrol_profiles: ${error.message}`);
  }

  if (!profile?.company_id) return;

  const companyUpdate = def.type === "gestao" ? { ativo: false } : { mkt_plan: "FREE" };
  const { error: companyError } = await admin
    .from("carcontrol_companies")
    .update(companyUpdate)
    .eq("id", profile.company_id);
  if (companyError) throw new Error(`DB carcontrol_companies: ${companyError.message}`);
}
