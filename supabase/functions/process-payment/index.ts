import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { processPaymentSchema } from "../_shared/schemas.ts";
import { readAndParseJsonBody } from "../_shared/validate.ts";
import { corsHeaders as sharedCors } from "../_shared/cors.ts";
import { hasActiveAccess } from "../_shared/asaas-webhook-logic.ts";
import {
  asaasErrorMessage,
  asaasRequest,
  cancelSubscriptionRows,
  createAdminClient,
  grantPlan,
  hasAsaasConfig,
  otherSubscriptionRows,
} from "../_shared/billing.ts";

const corsHeaders = (origin: string | null) => sharedCors(origin, "POST, OPTIONS");

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

type Coupon = {
  id: string;
  code: string;
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  min_amount: number | null;
  discount_type: string;
  discount_value: number;
};

async function loadCoupon(supabaseAdmin: any, code: string, amount: number) {
  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select("id, code, active, expires_at, max_uses, current_uses, min_amount, discount_type, discount_value")
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error("Erro ao validar cupom: " + error.message);
  if (!coupon) throw new Error("Cupom invalido");
  const c = coupon as Coupon;
  if (!c.active) throw new Error("Cupom inativo");
  if (c.expires_at && new Date(c.expires_at) < new Date()) throw new Error("Cupom expirado");
  if (c.max_uses !== null && c.current_uses >= c.max_uses) throw new Error("Cupom esgotado");
  if (c.min_amount !== null && amount < c.min_amount) throw new Error("Valor minimo nao atingido para este cupom");

  const discount = c.discount_type === "percentual"
    ? Math.round(amount * (c.discount_value / 100) * 100) / 100
    : Math.min(c.discount_value, amount);

  return { coupon: c, discount, finalAmount: Math.max(0, Math.round((amount - discount) * 100) / 100) };
}

/** Counts one use with optimistic concurrency so two checkouts cannot both take the last use. */
async function claimCoupon(supabaseAdmin: any, couponId: string): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: current, error } = await supabaseAdmin
      .from("coupons")
      .select("current_uses, max_uses")
      .eq("id", couponId)
      .single();
    if (error) throw new Error("Erro ao atualizar uso do cupom");
    if (current.max_uses !== null && current.current_uses >= current.max_uses) throw new Error("Cupom esgotado");

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("coupons")
      .update({ current_uses: current.current_uses + 1 })
      .eq("id", couponId)
      .eq("current_uses", current.current_uses)
      .select("id");
    if (updateError) throw new Error("Erro ao atualizar uso do cupom");
    if (updated?.length) return;
  }
  throw new Error("Erro ao atualizar uso do cupom");
}

async function releaseCoupon(supabaseAdmin: any, couponId: string): Promise<void> {
  const { data: current } = await supabaseAdmin.from("coupons").select("current_uses").eq("id", couponId).single();
  if (!current || current.current_uses <= 0) return;
  await supabaseAdmin
    .from("coupons")
    .update({ current_uses: current.current_uses - 1 })
    .eq("id", couponId)
    .eq("current_uses", current.current_uses);
}

async function ensureCompany(supabaseAdmin: any, user: any, body: any) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("carcontrol_profiles")
    .select("id, company_id, asaas_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw new Error(`DB carcontrol_profiles: ${profileError.message}`);
  if (profile?.company_id) return { profile, companyId: profile.company_id as string };

  if (!profile) {
    const { error: createError } = await supabaseAdmin
      .from("carcontrol_profiles")
      .upsert({ id: user.id, email: user.email ?? null, nome: body?.nome ?? null }, { onConflict: "id" });
    if (createError) throw new Error(`DB carcontrol_profiles: ${createError.message}`);
  }

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
  return { profile, companyId: company.id as string };
}

/**
 * Records a checkout awaiting payment. Access the user already has (trial, paid plan) is kept
 * until the new charge is confirmed; only users without access are sent to the pending screen.
 */
async function recordPendingCheckout(
  supabaseAdmin: any,
  user: any,
  companyId: string,
  planDef: PlanDef,
  body: any,
  customerId: string,
) {
  const [{ data: profile, error: profileError }, { data: company, error: companyError }] = await Promise.all([
    supabaseAdmin.from("carcontrol_profiles").select("trial, created_at, status, plano_ativo").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("carcontrol_companies").select("ativo").eq("id", companyId).maybeSingle(),
  ]);
  if (profileError) throw new Error(`DB carcontrol_profiles: ${profileError.message}`);
  if (companyError) throw new Error(`DB carcontrol_companies: ${companyError.message}`);

  const update: Record<string, unknown> = { asaas_customer_id: customerId, email: user.email };
  if (body?.nome) update.nome = body.nome;
  if (!hasActiveAccess(profile ?? null, company?.ativo === true)) {
    update.plan = planDef.slug;
    update.plano_ativo = planDef.slug;
    update.status = "pending";
  }

  const { error } = await supabaseAdmin.from("carcontrol_profiles").update(update).eq("id", user.id);
  if (error) throw new Error(`DB carcontrol_profiles: ${error.message}`);
}

async function firstChargeInfo(subscriptionId: string, metodo: string): Promise<Record<string, unknown> | null> {
  if (metodo !== "BOLETO" && metodo !== "PIX") return null;

  const paymentsRes = await asaasRequest(`/subscriptions/${subscriptionId}/payments?limit=1`);
  const firstPayment = paymentsRes.ok ? paymentsRes.data?.data?.[0] : null;
  if (!firstPayment) return null;

  if (metodo === "BOLETO") {
    return {
      invoiceUrl: firstPayment.invoiceUrl || null,
      bankSlipUrl: firstPayment.bankSlipUrl || null,
      boletoBarCode: firstPayment.boletoBarCode || null,
      boletoCode: firstPayment.boletoCode || null,
    };
  }

  let info: Record<string, unknown> = {
    invoiceUrl: firstPayment.invoiceUrl || null,
    pixQrCode: firstPayment.pixQrCode || null,
    pixCopiaECola: firstPayment.pixCopiaECola || null,
    payload: firstPayment.payload || null,
  };

  if (!info.pixQrCode && !info.pixCopiaECola && !info.payload && firstPayment.id) {
    const pixRes = await asaasRequest(`/payments/${firstPayment.id}/pixQrCode`);
    if (pixRes.ok) {
      const pixData = pixRes.data ?? {};
      info = {
        invoiceUrl: firstPayment.invoiceUrl || null,
        pixQrCode: pixData.encodedImage || pixData.pixQrCode || null,
        pixCopiaECola: pixData.payload || pixData.pixCopiaECola || null,
        payload: pixData.payload || pixData.pixCopiaECola || null,
      };
    }
  }
  return info;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers });

  const supabaseAdmin = createAdminClient();

  let createdSubscriptionId: string | null = null;
  let insertedPaymentId: string | null = null;
  let claimedCouponId: string | null = null;

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
    if (!allowed) return rateLimitResponse(origin, retryAfter);

    const parsed = await readAndParseJsonBody(req, processPaymentSchema, headers);
    if (!parsed.ok) return parsed.response;

    const body = parsed.data;
    const {
      nome, cpf, cep, endereco, numero, complemento, bairro, cidade, estado, telefone,
      cardName, cardNumber, cardExpiry, cardCvv,
      plan, planType, billingType, coupon_code, validate_only,
    } = body;

    const metodo = billingType || "CREDIT_CARD";
    const planDef = normalizePlan(plan, planType);
    const amount = priceFor(planDef);

    let discountAmount = 0;
    let finalAmount = amount;
    let coupon: Coupon | null = null;

    if (coupon_code) {
      const result = await loadCoupon(supabaseAdmin, coupon_code, amount);
      coupon = result.coupon;
      discountAmount = result.discount;
      finalAmount = result.finalAmount;
    }
    const appliedCoupon = coupon?.code ?? null;

    if (validate_only) {
      return reply({
        valid: true,
        coupon_code: appliedCoupon,
        original_amount: amount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
      });
    }

    const { profile, companyId } = await ensureCompany(supabaseAdmin, user, body);

    if (amount === 0 || finalAmount <= 0) {
      if (coupon) {
        await claimCoupon(supabaseAdmin, coupon.id);
        claimedCouponId = coupon.id;
      }

      await grantPlan(supabaseAdmin, user.id, planDef.slug, null);

      const { error: payError } = await supabaseAdmin.from("payments").insert({
        user_id: user.id,
        plan: planDef.slug,
        amount: 0,
        status: "APPROVED",
        paid_at: new Date().toISOString(),
        discount_amount: discountAmount,
        coupon_code: appliedCoupon,
      });
      if (payError) throw new Error(`DB payments: ${payError.message}`);
      claimedCouponId = null;

      try {
        const replaced = await otherSubscriptionRows(
          supabaseAdmin, user.id, planDef.slug, ["PENDING", "APPROVED", "REJECTED"],
        );
        if (replaced.length && hasAsaasConfig()) await cancelSubscriptionRows(supabaseAdmin, replaced);
      } catch (err) {
        console.error("Falha ao cancelar assinaturas substituidas", (err as Error)?.message);
      }

      return reply({
        success: true,
        free: true,
        status: "APPROVED",
        plan: planDef.slug,
        coupon_applied: !!appliedCoupon,
        coupon_code: appliedCoupon,
        original_amount: amount,
        discount_amount: discountAmount,
        final_amount: 0,
      });
    }

    if (!hasAsaasConfig()) throw new Error("Credenciais Asaas nao configuradas no servidor");
    if (!telefone) throw new Error("Telefone de contato e obrigatorio");

    for (const [k, v] of Object.entries({ nome, cpf, cep, endereco, numero, cidade, estado })) {
      if (!v) throw new Error(`Campo obrigatorio ausente: ${k}`);
    }

    if (metodo === "CREDIT_CARD") {
      for (const [k, v] of Object.entries({ cardName, cardNumber, cardExpiry, cardCvv })) {
        if (!v) throw new Error(`Campo obrigatorio ausente: ${k}`);
      }
    }

    const cpfClean = sanitizeDigits(cpf as string);
    const cepClean = sanitizeDigits(cep as string);

    let cardNumberClean = "";
    let expiryMonth = "";
    let expiryYear = "";
    if (metodo === "CREDIT_CARD") {
      cardNumberClean = sanitizeDigits(cardNumber as string);
      const [month, yearShort] = String(cardExpiry).split("/");
      if (!month || !yearShort) throw new Error("Validade do cartao invalida");
      expiryMonth = month;
      expiryYear = yearShort.length === 2 ? `20${yearShort}` : yearShort;
    }

    let customerId: string | null = profile?.asaas_customer_id ?? null;

    if (!customerId) {
      const customerRes = await asaasRequest("/customers", {
        method: "POST",
        body: {
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
        },
      });
      if (!customerRes.ok || !customerRes.data?.id) {
        throw new Error(asaasErrorMessage(customerRes, "Erro ao criar cliente no Asaas"));
      }
      customerId = customerRes.data.id as string;
      await supabaseAdmin.from("carcontrol_profiles").update({ asaas_customer_id: customerId }).eq("id", user.id);
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
        mobilePhone: sanitizeDigits(telefone as string),
      };
    }

    const subRes = await asaasRequest("/subscriptions", { method: "POST", body: subPayload });
    if (!subRes.ok || !subRes.data?.id) {
      throw new Error(asaasErrorMessage(subRes, "Erro ao criar assinatura no Asaas"));
    }
    const subscriptionId = subRes.data.id as string;
    createdSubscriptionId = subscriptionId;

    if (coupon) {
      await claimCoupon(supabaseAdmin, coupon.id);
      claimedCouponId = coupon.id;
    }

    const paymentInfo = await firstChargeInfo(subscriptionId, metodo);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        plan: planDef.slug,
        amount: finalAmount,
        status: "PENDING",
        asaas_subscription_id: subscriptionId,
        billing_type: metodo,
        payment_info: paymentInfo,
        coupon_code: appliedCoupon,
        discount_amount: discountAmount,
      })
      .select("id")
      .single();
    if (insertError) throw new Error(`DB payments: ${insertError.message}`);
    insertedPaymentId = inserted.id;

    await recordPendingCheckout(supabaseAdmin, user, companyId, planDef, body, customerId);

    createdSubscriptionId = null;
    insertedPaymentId = null;
    claimedCouponId = null;

    // Checkouts anteriores nunca pagos do mesmo tipo de plano deixam de cobrar.
    try {
      const abandoned = await otherSubscriptionRows(
        supabaseAdmin, user.id, planDef.slug, ["PENDING", "REJECTED"], subscriptionId,
      );
      await cancelSubscriptionRows(supabaseAdmin, abandoned);
    } catch (err) {
      console.error("Falha ao cancelar checkouts anteriores", (err as Error)?.message);
    }

    return reply({
      success: true,
      subscriptionId,
      status: "PENDING",
      plan: planDef.slug,
      billingType: metodo,
      paymentInfo,
      coupon_applied: !!appliedCoupon,
      coupon_code: appliedCoupon,
      original_amount: amount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    });
  } catch (error) {
    if (insertedPaymentId) {
      await supabaseAdmin.from("payments").delete().eq("id", insertedPaymentId).then(() => {}, () => {});
    }
    if (createdSubscriptionId) {
      await asaasRequest(`/subscriptions/${createdSubscriptionId}`, { method: "DELETE" }).catch(() => null);
    }
    if (claimedCouponId) {
      await releaseCoupon(supabaseAdmin, claimedCouponId).catch(() => {});
    }

    return reply({ error: (error as Error)?.message ?? "Erro desconhecido" }, 400);
  }
});
