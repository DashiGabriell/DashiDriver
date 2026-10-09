import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
  clientIp,
} from "../_shared/rate-limit.ts";
import { asaasWebhookSchema } from "../_shared/schemas.ts";
import {
  CLOSED_PAYMENT_STATUSES,
  extractSubscriptionId,
  isSubscriptionEndedEvent,
  pendingRowOutcome,
  resolveWebhookAction,
} from "../_shared/asaas-webhook-logic.ts";
import {
  asaasRequest,
  confirmSubscriptionPayment,
  createAdminClient,
  isCurrentSubscription,
  revokePlan,
} from "../_shared/billing.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Metodo nao permitido" }, 405);

  const supabaseAdmin = createAdminClient();

  const ip = clientIp(req);
  const { allowed, retryAfter } = await checkRateLimit(
    supabaseAdmin,
    `asaas:${ip}`,
    RATE_LIMITS.asaasWebhook.max,
    RATE_LIMITS.asaasWebhook.windowSeconds,
  );
  if (!allowed) return rateLimitResponse(null, retryAfter);

  // Asaas envia o token configurado no painel no cabeçalho "asaas-access-token".
  const expectedSecret = Deno.env.get("ASAAS_WEBHOOK_SECRET") ?? "";
  const receivedSecret = req.headers.get("asaas-access-token") ?? req.headers.get("x-asaas-webhook-secret") ?? "";
  if (!expectedSecret || !safeEqual(receivedSecret, expectedSecret)) {
    return json({ error: "Unauthorized" }, 401);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Corpo da requisicao invalido" }, 400);
  }

  // Eventos de cobranças avulsas (sem assinatura) não pertencem a este fluxo; 200 evita que o Asaas pause a fila.
  const asaasSubscriptionId = extractSubscriptionId(raw);
  if (!asaasSubscriptionId) return json({ ignored: "sem assinatura" });

  const parsed = asaasWebhookSchema.safeParse(raw);
  if (!parsed.success) return json({ ignored: "payload fora do formato esperado" });

  const payload = parsed.data;
  const event = payload.event;
  const action = resolveWebhookAction(event);
  if (action === "ignore") return json({ ignored: event });

  try {
    const { data: row, error: rowError } = await supabaseAdmin
      .from("payments")
      .select("id, user_id, plan, status, asaas_subscription_id")
      .eq("asaas_subscription_id", asaasSubscriptionId)
      .maybeSingle();
    if (rowError) throw new Error(`DB payments: ${rowError.message}`);
    if (!row) return json({ ignored: "assinatura desconhecida" });
    if (CLOSED_PAYMENT_STATUSES.has(row.status)) return json({ ignored: "assinatura substituida" });

    const asaasPaymentId = payload.payment?.id ?? null;

    if (action === "activate") {
      const dueDate = typeof payload.payment?.dueDate === "string" ? payload.payment.dueDate : null;
      await confirmSubscriptionPayment(supabaseAdmin, {
        userId: row.user_id,
        subscriptionId: asaasSubscriptionId,
        plan: row.plan,
        asaasPaymentId,
        dueDate,
      });
      return json({ ok: true, action });
    }

    if (row.status === "APPROVED" && (await isCurrentSubscription(supabaseAdmin, row.user_id, row))) {
      await revokePlan(supabaseAdmin, row.user_id, row.plan);
    }

    let nextStatus = isSubscriptionEndedEvent(event) ? "CANCELED" : "REJECTED";
    if (row.status === "PENDING") {
      const outcome = pendingRowOutcome(event);
      if (outcome === "cancel_remote") {
        const res = await asaasRequest(`/subscriptions/${asaasSubscriptionId}`, { method: "DELETE" });
        nextStatus = res.ok || res.status === 404 ? "CANCELED" : "REJECTED";
      } else {
        nextStatus = outcome === "canceled" ? "CANCELED" : "REJECTED";
      }
    }

    const patch: Record<string, unknown> = { status: nextStatus };
    if (asaasPaymentId) patch.asaas_payment_id = asaasPaymentId;
    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update(patch)
      .eq("id", row.id)
      .eq("status", row.status);
    if (updateError) throw new Error(`DB payments: ${updateError.message}`);

    return json({ ok: true, action, status: nextStatus });
  } catch (error) {
    console.error("asaas-webhook", event, asaasSubscriptionId, (error as Error)?.message);
    return json({ error: (error as Error)?.message ?? "Erro" }, 500);
  }
});
