import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
  clientIp,
} from "../_shared/rate-limit.ts";
import { asaasWebhookSchema } from "../_shared/schemas.ts";
import { readAndParseJsonBody } from "../_shared/validate.ts";
import { planDef, resolveWebhookAction } from "../_shared/asaas-webhook-logic.ts";

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

async function deactivatePlan(supabaseAdmin: any, userId: string, slug: string) {
  const def = planDef(slug);

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("carcontrol_profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;

  await supabaseAdmin
    .from("carcontrol_profiles")
    .update({ status: "inativo" })
    .eq("id", userId);

  if (!profile?.company_id) return;

  if (def.type === "gestao") {
    await supabaseAdmin
      .from("carcontrol_companies")
      .update({ ativo: false })
      .eq("id", profile.company_id);
  } else {
    await supabaseAdmin
      .from("carcontrol_companies")
      .update({ mkt_plan: "FREE" })
      .eq("id", profile.company_id);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(req.headers.get("origin")) });
  }

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

  const ip = clientIp(req);
  const { allowed, retryAfter } = await checkRateLimit(
    supabaseAdmin,
    `asaas:${ip}`,
    RATE_LIMITS.asaasWebhook.max,
    RATE_LIMITS.asaasWebhook.windowSeconds,
  );
  if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

  const webhookSecret = req.headers.get("x-asaas-webhook-secret");
  if (webhookSecret !== Deno.env.get("ASAAS_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const headers = corsHeaders(req.headers.get("origin"));
  const parsed = await readAndParseJsonBody(req, asaasWebhookSchema, headers);
  if (!parsed.ok) return parsed.response;

  const payload = parsed.data;
  const event = payload.event;
  const asaasSubscriptionId = payload.payment?.subscription ?? payload.subscription;

  if (!asaasSubscriptionId) {
    return new Response("No subscription ID", { status: 400 });
  }

  try {
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("user_id, plan")
      .eq("asaas_subscription_id", asaasSubscriptionId)
      .maybeSingle();

    if (paymentError || !payment) {
      throw new Error("Assinatura nao encontrada na tabela de pagamentos");
    }

    const action = resolveWebhookAction(event);

    if (action === "activate") {
      await activatePlan(supabaseAdmin, payment.user_id, payment.plan);

      await supabaseAdmin
        .from("payments")
        .update({
          status: "APPROVED",
          asaas_payment_id: payload.payment?.id ?? null,
          paid_at: new Date().toISOString(),
        })
        .eq("asaas_subscription_id", asaasSubscriptionId);
    } else if (action === "deactivate") {
      await deactivatePlan(supabaseAdmin, payment.user_id, payment.plan);

      await supabaseAdmin
        .from("payments")
        .update({
          status: "REJECTED",
          asaas_payment_id: payload.payment?.id ?? null,
        })
        .eq("asaas_subscription_id", asaasSubscriptionId);
    }

    return new Response("OK", { status: 200, headers: corsHeaders(req.headers.get("origin")) });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
