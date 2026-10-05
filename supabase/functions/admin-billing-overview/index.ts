import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { corsHeaders, getSecretKey } from "../_shared/cors.ts";

const SAAS_PLAN_PRICE: Record<string, number> = {
  BASICO: 99,
  PRO: 199,
  MASTER: 399,
};

const MKT_PLAN_PRICE: Record<string, number> = {
  FREE: 0,
  PRO: 149,
  ELITE: 299,
};

const PLAN_LABEL: Record<string, string> = {
  "gestao-basico": "Gestão Básico",
  "gestao-pro": "Gestão Pro",
  "gestao-master": "Gestão Master",
  "marketplace-free": "Marketplace Free",
  "marketplace-pro": "Marketplace Pro",
  "marketplace-elite": "Marketplace Elite",
  "free7dias": "Trial 7 Dias",
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin, "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const secretKey = getSecretKey();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    if (!secretKey) throw new Error("Secret key nao disponivel");

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { apikey: secretKey } },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token ausente");

    const jwt = authHeader.replace("Bearer ", "");

    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: secretKey,
      },
    });

    if (!userResp.ok) throw new Error("Nao autenticado");

    const userData: { id: string } = await userResp.json();

    const { allowed, retryAfter } = await checkRateLimit(
      supabase,
      `billing:${userData.id}`,
      RATE_LIMITS.admin.max,
      RATE_LIMITS.admin.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(origin, retryAfter);

    const { data: profile } = await supabase
      .from("carcontrol_profiles")
      .select("role")
      .eq("id", userData.id)
      .maybeSingle();

    if (profile?.role !== "dev") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { action, paymentId } = body as { action?: string; paymentId?: string };

    if (action === "deletePayment" && paymentId) {
      const { error } = await supabase.from("payments").delete().eq("id", paymentId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const [companiesRes, paymentsRes] = await Promise.all([
      supabase.from("carcontrol_companies").select("id, saas_plan, mkt_plan, ativo"),
      supabase
        .from("payments")
        .select("id, plan, amount, status, paid_at, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    if (companiesRes.error) throw companiesRes.error;
    if (paymentsRes.error) throw paymentsRes.error;

    const companies = companiesRes.data ?? [];
    const payments = paymentsRes.data ?? [];

    const saasPlans = ["BASICO", "PRO", "MASTER"];
    const mktPlans = ["FREE", "PRO", "ELITE"];

    const bySaasPlan: Record<string, number> = {};
    const byMktPlan: Record<string, number> = {};
    saasPlans.forEach((p) => (bySaasPlan[p] = 0));
    mktPlans.forEach((p) => (byMktPlan[p] = 0));

    let monthlyRecurringRevenue = 0;
    let activeCompanies = 0;
    let inactiveCompanies = 0;

    for (const company of companies) {
      if (company.ativo) {
        activeCompanies += 1;
        monthlyRecurringRevenue +=
          (SAAS_PLAN_PRICE[company.saas_plan] ?? 0) +
          (MKT_PLAN_PRICE[company.mkt_plan] ?? 0);
        if (company.saas_plan in bySaasPlan) bySaasPlan[company.saas_plan] += 1;
        if (company.mkt_plan in byMktPlan) byMktPlan[company.mkt_plan] += 1;
      } else {
        inactiveCompanies += 1;
      }
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString();

    let revenueThisMonth = 0;
    const recentPayments = payments.map((p: Record<string, unknown>) => ({
      id: p.id,
      valor: (p.amount ?? 0) as number,
      status: p.status,
      data: (p.paid_at ?? p.created_at) as string,
      metodo: PLAN_LABEL[p.plan as string] ?? (p.plan as string),
    }));

    for (const payment of recentPayments) {
      if (payment.status === "APPROVED" && payment.data >= startOfMonth) {
        revenueThisMonth += payment.valor;
      }
    }

    return new Response(
      JSON.stringify({
        activeCompanies,
        inactiveCompanies,
        monthlyRecurringRevenue,
        revenueThisMonth,
        overdueCount: 0,
        overdueAmount: 0,
        bySaasPlan,
        byMktPlan,
        recentPayments,
      }),
      {
        headers: { ...headers, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
