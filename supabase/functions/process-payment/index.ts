import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { processPaymentSchema } from "../_shared/schemas.ts";
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

type PlanType = "gestao" | "marketplace";
type PlanDef = {
  slug: string;
  type: PlanType;
  label: string;
  saasPlan?: "BASICO" | "PRO" | "MASTER";
  mktPlan?: "FREE" | "PRO" | "ELITE";
};

const PLAN_ALIASES: Record<string, PlanDef> = {
  "gestao-basico": { slug: "gestao-basico", type: "gestao", label: "Gestao Basico", saasPlan: "BASICO" },
  "gestao-pro": { slug: "gestao-pro", type: "gestao", label: "Gestao Pro", saasPlan: "PRO" },
  "gestao-master": { slug: "gestao-master", type: "gestao", label: "Gestao Master", saasPlan: "MASTER" },
  "basico": { slug: "gestao-basico", type: "gestao", label: "Gestao Basico", saasPlan: "BASICO" },
  "pro": { slug: "gestao-pro", type: "gestao", label: "Gestao Pro", saasPlan: "PRO" },
  "master": { slug: "gestao-master", type: "gestao", label: "Gestao Master", saasPlan: "MASTER" },
  "gestao basico": { slug: "gestao-basico", type: "gestao", label: "Gestao Basico", saasPlan: "BASICO" },
  "gestao pro": { slug: "gestao-pro", type: "gestao", label: "Gestao Pro", saasPlan: "PRO" },
  "gestao master": { slug: "gestao-master", type: "gestao", label: "Gestao Master", saasPlan: "MASTER" },
  "marketplace-free": { slug: "marketplace-free", type: "marketplace", label: "Marketplace Free", mktPlan: "FREE" },
  "marketplace-pro": { slug: "marketplace-pro", type: "marketplace", label: "Marketplace Pro", mktPlan: "PRO" },
  "marketplace-elite": { slug: "marketplace-elite", type: "marketplace", label: "Marketplace Elite", mktPlan: "ELITE" },
  "marketplace free": { slug: "marketplace-free", type: "marketplace", label: "Marketplace Free", mktPlan: "FREE" },
  "marketplace pro": { slug: "marketplace-pro", type: "marketplace", label: "Marketplace Pro", mktPlan: "PRO" },
  "marketplace elite": { slug: "marketplace-elite", type: "marketplace", label: "Marketplace Elite", mktPlan: "ELITE" },
};

// Fonte da verdade do preço: o valor enviado pelo cliente nunca é usado para cobrar ou ativar plano.
const PLAN_PRICES: Record<string, number> = {
  "gestao-basico": 199,
  "gestao-pro": 399,
  "gestao-master": 799,
  "marketplace-free": 0,
  "marketplace-pro": 119,
  "marketplace-elite": 299,
};

const priceFor = (planDef: PlanDef): number => {
  const price = PLAN_PRICES[planDef.slug];
  if (price === undefined) throw new Error(`Preco nao configurado para o plano ${planDef.slug}`);
  return price;
};

const log = (msg: string, data?: unknown) => {

};

const sanitizeDigits = (v: string) => (v || "").replace(/\D/g, "");

const normalizeKey = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const normalizePlan = (plan: string, requestedType?: PlanType): PlanDef => {
  const key = normalizeKey(plan);
  const dashed = key.replace(/\s+/g, "-");
  const exact = PLAN_ALIASES[dashed] || PLAN_ALIASES[key];
  if (!exact) throw new Error(`Plano invalido: ${plan}`);

  if (requestedType && exact.type !== requestedType) {
    if (requestedType === "marketplace" && key === "free") return PLAN_ALIASES["marketplace-free"];
    throw new Error(`Tipo de plano invalido para ${plan}`);
  }

  return exact;
};

const computeExpiration = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
};

async function ensureCompany(supabaseAdmin: any, user: any, body: any) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("carcontrol_profiles")
    .select("id, email, full_name, nome, company_id, asaas_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw new Error(`DB carcontrol_profiles: ${profileError.message}`);
  if (profile?.company_id) return { profile, companyId: profile.company_id };

  const companyName = body?.empresa || body?.locadora || body?.nome || user.email || "DashiDrive";
  const { data: company, error: companyError } = await supabaseAdmin
    .from("carcontrol_companies")
    .insert({
      nome: companyName,
      email: user.email ?? null,
      telefone: sanitizeDigits(body?.telefone || "") || null,
      endereco: [body?.endereco, body?.numero, body?.bairro, body?.cidade, body?.estado].filter(Boolean).join(", ") || null,
      ativo: false,
    })
    .select("id")
    .single();

  if (companyError) throw new Error(`DB carcontrol_companies: ${companyError.message}`);

  const { error: linkError } = await supabaseAdmin
    .from("carcontrol_profiles")
    .update({ company_id: company.id, role: "admin" })
    .eq("id", user.id);

  if (linkError) throw new Error(`DB link company: ${linkError.message}`);
  return { profile, companyId: company.id };
}

async function applyPlan(
  supabaseAdmin: any,
  user: any,
  companyId: string,
  planDef: PlanDef,
  status: "pending" | "ativo",
  body: any,
  asaasCustomerId?: string | null,
) {
  const expiration = computeExpiration();

  const profileUpdate: Record<string, unknown> = {
    email: user.email,
    nome: body?.nome ?? null,
    plan: planDef.slug,
    plano_ativo: planDef.slug,
    status,
    data_expiracao: expiration,
    trial: null,
  };

  if (asaasCustomerId) profileUpdate.asaas_customer_id = asaasCustomerId;

  const { error: profileError } = await supabaseAdmin
    .from("carcontrol_profiles")
    .upsert({ id: user.id, ...profileUpdate }, { onConflict: "id" });

  if (profileError) throw new Error(`DB carcontrol_profiles: ${profileError.message}`);

  const companyUpdate: Record<string, unknown> = { trial: null };

  if (planDef.type === "gestao") {
    companyUpdate.saas_plan = planDef.saasPlan;
    companyUpdate.ativo = status === "ativo";
  } else if (status === "ativo") {
    companyUpdate.mkt_plan = planDef.mktPlan;
  }

  const { error: companyError } = await supabaseAdmin
    .from("carcontrol_companies")
    .update(companyUpdate)
    .eq("id", companyId);

  if (companyError) throw new Error(`DB carcontrol_companies: ${companyError.message}`);
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

  let createdAsaasId: { type: "subscription" | "payment"; id: string } | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token de autenticacao ausente");

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !user) throw new Error("Usuario nao autenticado");

    const { allowed, retryAfter } = await checkRateLimit(
      supabaseAdmin,
      `payment:${user.id}`,
      RATE_LIMITS.payment.max,
      RATE_LIMITS.payment.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

    const origin = req.headers.get("origin");
    const headers = corsHeaders(origin);
    const parsed = await readAndParseJsonBody(req, processPaymentSchema, headers);
    if (!parsed.ok) return parsed.response;

    const body = parsed.data;
    log("Body recebido com sucesso", { keys: Object.keys(body), hasCoupon: !!body.coupon_code });
    const {
      nome, cpf, cep, endereco, numero, complemento, bairro, cidade, estado, telefone,
      cardName, cardNumber, cardExpiry, cardCvv,
      plan, planType, billingType, coupon_code, validate_only,
    } = body;

    const metodo = billingType || "CREDIT_CARD";

    const planDef = normalizePlan(plan, planType);
    const amount = priceFor(planDef);
    const { profile, companyId } = await ensureCompany(supabaseAdmin, user, body);

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    const asaasBaseUrl = Deno.env.get("ASAAS_BASE_URL");
    if (!asaasApiKey || !asaasBaseUrl) {
      throw new Error("Credenciais Asaas nao configuradas no servidor");
    }

    let discountAmount = 0;
    let finalAmount = amount;
    let appliedCoupon: string | null = null;

    log("coupon_code received", coupon_code);

    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .maybeSingle();

      if (couponError) {
        log("Erro ao consultar cupom", { error: couponError, code: coupon_code });
        throw new Error("Erro ao validar cupom: " + couponError.message);
      }

      if (!coupon) throw new Error("Cupom invalido");
      if (!coupon.active) throw new Error("Cupom inativo");
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) throw new Error("Cupom expirado");
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) throw new Error("Cupom esgotado");
      if (coupon.min_amount !== null && amount < coupon.min_amount) throw new Error("Valor minimo nao atingido para este cupom");

      if (coupon.discount_type === "percentual") {
        discountAmount = Math.round(amount * (coupon.discount_value / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(coupon.discount_value, amount);
      }

      finalAmount = Math.max(0, amount - discountAmount);

      if (!validate_only) {
        const { error: updateError } = await supabaseAdmin
          .from("coupons")
          .update({ current_uses: coupon.current_uses + 1 })
          .eq("id", coupon.id);

        if (updateError) throw new Error("Erro ao atualizar uso do cupom");
      }

      appliedCoupon = coupon_code;
      log("Cupom validado", { code: coupon_code, discountAmount, finalAmount, validate_only });
    }

    if (validate_only) {
      return new Response(
        JSON.stringify({
          valid: true,
          coupon_code: appliedCoupon,
          original_amount: amount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
        }),
        { headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
      );
    }

    if (amount === 0 || finalAmount <= 0) {
      log("Ativando plano gratuito (ou 100% de desconto)", { user: user.id, plan: planDef.slug, discountAmount });

      await applyPlan(supabaseAdmin, user, companyId, planDef, "ativo", body, profile?.asaas_customer_id ?? null);

      const paymentInsert = {
        user_id: user.id,
        plan: planDef.slug,
        amount,
        status: "APPROVED",
        paid_at: new Date().toISOString(),
        discount_amount: discountAmount,
        coupon_code: appliedCoupon,
      };
      const { error: payError } = await supabaseAdmin.from("payments").insert(paymentInsert);
      if (payError) log("Erro ao registrar pagamento gratuito", payError);

      return new Response(
        JSON.stringify({
          success: true,
          free: true,
          status: "APPROVED",
          plan: planDef.slug,
          coupon_applied: !!appliedCoupon,
          coupon_code: appliedCoupon,
          original_amount: amount,
          discount_amount: discountAmount,
          final_amount: 0,
        }),
        { headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
      );
    }

    if (!telefone) throw new Error("Telefone de contato e obrigatorio");

    for (const [k, v] of Object.entries({ nome, cpf, cep, endereco, numero, cidade, estado })) {
      if (!v) throw new Error(`Campo obrigatorio ausente: ${k}`);
    }

    if (metodo === "CREDIT_CARD") {
      for (const [k, v] of Object.entries({ cardName, cardNumber, cardExpiry, cardCvv })) {
        if (!v) throw new Error(`Campo obrigatorio ausente: ${k}`);
      }
    }

    const cpfClean = sanitizeDigits(cpf);
    const cepClean = sanitizeDigits(cep);

    let cardNumberClean = "";
    let expiryMonth = "";
    let expiryYearShort = "";
    let expiryYear = "";
    if (metodo === "CREDIT_CARD") {
      cardNumberClean = sanitizeDigits(cardNumber);
      [expiryMonth, expiryYearShort] = String(cardExpiry).split("/");
      if (!expiryMonth || !expiryYearShort) throw new Error("Validade do cartao invalida");
      expiryYear = expiryYearShort.length === 2 ? `20${expiryYearShort}` : expiryYearShort;
    }

    const asaasHeaders = {
      "access_token": asaasApiKey,
      "Content-Type": "application/json",
    };

    let customerId: string | null = profile?.asaas_customer_id ?? null;

    if (!customerId) {
      const customerPayload = {
        name: nome,
        cpfCnpj: cpfClean,
        email: user.email,
        postalCode: cepClean,
        address: endereco,
        addressNumber: numero,
        complement: complemento,
        province: bairro,
        city: cidade,
        state: estado,
        externalReference: user.id,
        notificationDisabled: true,
      };
      const customerUrl = `${asaasBaseUrl}/customers`;
      let customerRes = await fetch(customerUrl, {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify(customerPayload),
      });
      // Se houver redirect (301/302), o Deno fetch muda POST para GET,
      // então refazemos manualmente mantendo o POST
      if (customerRes.status >= 301 && customerRes.status <= 308) {
        const location = customerRes.headers.get("location");
        if (location) {
          log("Asaas redirect", { from: customerUrl, to: location });
          customerRes = await fetch(location, {
            method: "POST",
            headers: asaasHeaders,
            body: JSON.stringify(customerPayload),
          });
        }
      }
      let customerData: any;
      try {
        customerData = await customerRes.json();
      } catch {
        const rawText = await customerRes.text().catch(() => "");
        log("Erro ao parsear resposta do Asaas (create customer)", { status: customerRes.status, raw: rawText.slice(0, 500) });
        throw new Error(`Asaas retornou status ${customerRes.status} com resposta invalida ao criar cliente`);
      }
      log("Resposta Asaas create customer", { status: customerRes.status, data: JSON.stringify(customerData).slice(0, 500) });
      if (!customerRes.ok || !customerData.id) {
        const errMsg = customerData.errors?.[0]?.description || customerData.error || `Resposta inesperada do Asaas (status ${customerRes.status}): ${JSON.stringify(customerData).slice(0, 200)}`;
        throw new Error(errMsg);
      }
      customerId = customerData.id;
    }

    const today = new Date().toISOString().slice(0, 10);
    const subPayload: Record<string, unknown> = {
      customer: customerId,
      billingType: metodo,
      value: finalAmount,
      cycle: "MONTHLY",
      nextDueDate: today,
      description: `Plano ${planDef.label}`,
      externalReference: `${user.id}_${planDef.slug}_${Date.now()}`,
    };

    if (metodo === "CREDIT_CARD") {
      subPayload.creditCard = {
        holderName: cardName,
        number: cardNumberClean,
        expiryMonth,
        expiryYear,
        ccv: cardCvv,
      };
      subPayload.creditCardHolderInfo = {
        name: nome,
        email: user.email,
        cpfCnpj: cpfClean,
        postalCode: cepClean,
        addressNumber: numero,
        address: endereco,
        province: bairro,
        city: cidade,
        complement: complemento,
        mobilePhone: sanitizeDigits(telefone),
      };
    }

    let subRes = await fetch(`${asaasBaseUrl}/subscriptions`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify(subPayload),
    });
    if (subRes.status >= 301 && subRes.status <= 308) {
      const location = subRes.headers.get("location");
      if (location) {
        log("Asaas redirect (subscription)", { from: `${asaasBaseUrl}/subscriptions`, to: location });
        subRes = await fetch(location, {
          method: "POST",
          headers: asaasHeaders,
          body: JSON.stringify(subPayload),
        });
      }
    }

    let subData: any;
    try {
      subData = await subRes.json();
    } catch {
      const rawText = await subRes.text().catch(() => "");
      log("Erro ao parsear resposta do Asaas (create subscription)", { status: subRes.status, raw: rawText.slice(0, 300) });
      throw new Error(`Asaas retornou status ${subRes.status} com resposta invalida ao criar assinatura`);
    }
    if (!subRes.ok || !subData.id) {
      log("Falha subscription", subData);
      throw new Error(subData.errors?.[0]?.description || `Erro ao criar assinatura no Asaas (status ${subRes.status})`);
    }
    createdAsaasId = { type: "subscription", id: subData.id };

    let paymentInfo: Record<string, unknown> | null = null;

    if (metodo === "BOLETO") {
      const paymentsRes = await fetch(
        `${asaasBaseUrl}/subscriptions/${subData.id}/payments?limit=1`,
        { headers: asaasHeaders },
      );
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const firstPayment = paymentsData?.data?.[0];
        if (firstPayment) {
          paymentInfo = {
            invoiceUrl: firstPayment.invoiceUrl || null,
            bankSlipUrl: firstPayment.bankSlipUrl || null,
            boletoBarCode: firstPayment.boletoBarCode || null,
            boletoCode: firstPayment.boletoCode || null,
          };
        }
      }
    }

    if (metodo === "PIX") {
      const paymentsRes = await fetch(
        `${asaasBaseUrl}/subscriptions/${subData.id}/payments?limit=1`,
        { headers: asaasHeaders },
      );
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const firstPayment = paymentsData?.data?.[0];
        if (firstPayment) {
          paymentInfo = {
            invoiceUrl: firstPayment.invoiceUrl || null,
            pixQrCode: firstPayment.pixQrCode || null,
            pixCopiaECola: firstPayment.pixCopiaECola || null,
            payload: firstPayment.payload || null,
          };

          const precisaGerarQr = !paymentInfo.pixQrCode && !paymentInfo.pixCopiaECola && !paymentInfo.payload;
          if (precisaGerarQr && firstPayment.id) {
            const pixRes = await fetch(
              `${asaasBaseUrl}/payments/${firstPayment.id}/pixQrCode`,
              { headers: asaasHeaders },
            );
            if (pixRes.ok) {
              const pixData = await pixRes.json();
              paymentInfo = {
                invoiceUrl: firstPayment.invoiceUrl || null,
                pixQrCode: pixData.encodedImage || pixData.pixQrCode || null,
                pixCopiaECola: pixData.payload || pixData.pixCopiaECola || null,
                payload: pixData.payload || pixData.pixCopiaECola || null,
              };
            }
          }
        }
      }
    }

    await applyPlan(supabaseAdmin, user, companyId, planDef, "pending", body, customerId);

    const insertPayment = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      plan: planDef.slug,
      amount,
      status: "PENDING",
      asaas_subscription_id: subData.id,
      billing_type: metodo,
      payment_info: paymentInfo,
      coupon_code: appliedCoupon,
      discount_amount: discountAmount,
    });
    if (insertPayment.error) throw new Error(`DB payments: ${insertPayment.error.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subData.id,
        status: "PENDING",
        plan: planDef.slug,
        billingType: metodo,
        paymentInfo,
        coupon_applied: !!appliedCoupon,
        coupon_code: appliedCoupon,
        original_amount: amount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
      }),
      { headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    log("ERRO", error?.message);

    if (createdAsaasId) {
      try {
        await fetch(`${Deno.env.get("ASAAS_BASE_URL")}/${createdAsaasId.type === "subscription" ? "subscriptions" : "payments"}/${createdAsaasId.id}`, {
          method: "DELETE",
          headers: { "access_token": Deno.env.get("ASAAS_API_KEY")! },
        });
      } catch (_) { /* ignore */ }
    }

    return new Response(
      JSON.stringify({ error: error?.message ?? "Erro desconhecido" }),
      { status: 400, headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  }
});
