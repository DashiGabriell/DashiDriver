import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { checkPaymentStatusSchema } from "../_shared/schemas.ts";
import { readAndParseJsonBody } from "../_shared/validate.ts";

const ALLOWED_ORIGINS = [
  "https://dashidrive.com",
  "https://dashidrive.com.br",
  "http://localhost:8080",
];
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const mapStatus = (raw: string): "APPROVED" | "REJECTED" | "PENDING" => {
  const s = (raw || "").toUpperCase();
  if (["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH", "ACTIVE"].includes(s)) return "APPROVED";
  if (["REFUSED", "REJECTED", "FAILED", "OVERDUE", "CHARGEBACK"].includes(s)) return "REJECTED";
  return "PENDING";
};

type PlanDef = {
  type: "gestao" | "marketplace";
  saasPlan?: "BASICO" | "PRO" | "MASTER";
  mktPlan?: "FREE" | "PRO" | "ELITE";
};

const planDef = (slug: string): PlanDef => {
  const key = String(slug || "").toLowerCase();
  if (key === "gestao-basico") return { type: "gestao", saasPlan: "BASICO" };
  if (key === "gestao-pro") return { type: "gestao", saasPlan: "PRO" };
  if (key === "gestao-master") return { type: "gestao", saasPlan: "MASTER" };
  if (key === "marketplace-free") return { type: "marketplace", mktPlan: "FREE" };
  if (key === "marketplace-pro") return { type: "marketplace", mktPlan: "PRO" };
  if (key === "marketplace-elite") return { type: "marketplace", mktPlan: "ELITE" };
  throw new Error(`Plano invalido: ${slug}`);
};

async function activatePlan(supabaseAdmin: any, userId: string, slug: string) {
  const def = planDef(slug);

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("carcontrol_profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;

  await supabaseAdmin
    .from("carcontrol_profiles")
    .update({ status: "ativo", plan: slug, plano_ativo: slug, trial: null })
    .eq("id", userId);

  if (!profile?.company_id) return;

  const companyUpdate: Record<string, unknown> = { trial: null };
  if (def.type === "gestao") {
    companyUpdate.ativo = true;
    companyUpdate.saas_plan = def.saasPlan;
  } else {
    companyUpdate.mkt_plan = def.mktPlan;
  }

  await supabaseAdmin
    .from("carcontrol_companies")
    .update(companyUpdate)
    .eq("id", profile.company_id);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(req.headers.get("origin")) });
  }

  try {
    const _secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "[]");
    const _secretKey = _secretKeys[0] ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      _secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: { headers: { apikey: _secretKey } },
      },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token ausente");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !user) throw new Error("Usuario nao autenticado");

    const { allowed, retryAfter } = await checkRateLimit(
      supabaseAdmin,
      `pstatus:${user.id}`,
      RATE_LIMITS.paymentStatus.max,
      RATE_LIMITS.paymentStatus.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

    const headers = corsHeaders(req.headers.get("origin"));
    const parsed = await readAndParseJsonBody(req, checkPaymentStatusSchema, headers);
    if (!parsed.ok) return parsed.response;
    const { subscriptionId } = parsed.data;

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY")!;
    const asaasBaseUrl = Deno.env.get("ASAAS_BASE_URL")!;

    const paymentsRes = await fetch(
      `${asaasBaseUrl}/subscriptions/${subscriptionId}/payments?limit=1`,
      { headers: { "access_token": asaasApiKey } },
    );
    const paymentsData = await paymentsRes.json();
    const lastPayment = paymentsData?.data?.[0];

    let status: "APPROVED" | "REJECTED" | "PENDING" = "PENDING";
    if (lastPayment?.status) status = mapStatus(lastPayment.status);

    const { data: payment, error: paymentFetchError } = await supabaseAdmin
      .from("payments")
      .select("plan")
      .eq("asaas_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (paymentFetchError) throw paymentFetchError;

    if (status === "APPROVED") {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "APPROVED",
          asaas_payment_id: lastPayment?.id,
          paid_at: new Date().toISOString(),
        })
        .eq("asaas_subscription_id", subscriptionId)
        .eq("user_id", user.id);

      if (payment?.plan) await activatePlan(supabaseAdmin, user.id, payment.plan);
    } else if (status === "REJECTED") {
      await supabaseAdmin
        .from("payments")
        .update({ status: "REJECTED", asaas_payment_id: lastPayment?.id })
        .eq("asaas_subscription_id", subscriptionId)
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({ status, asaasStatus: lastPayment?.status ?? null }),
      { headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message ?? "Erro" }),
      { status: 400, headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  }
});
