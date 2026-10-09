import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";
import { checkPaymentStatusSchema } from "../_shared/schemas.ts";
import { readAndParseJsonBody } from "../_shared/validate.ts";
import { corsHeaders as sharedCors } from "../_shared/cors.ts";
import { asaasRequest, confirmSubscriptionPayment, createAdminClient } from "../_shared/billing.ts";

const corsHeaders = (origin: string | null) => sharedCors(origin, "POST, OPTIONS");

const mapStatus = (raw: string): "APPROVED" | "REJECTED" | "PENDING" => {
  const s = (raw || "").toUpperCase();
  if (["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(s)) return "APPROVED";
  if (["REFUSED", "REJECTED", "FAILED", "OVERDUE", "CHARGEBACK_REQUESTED", "REFUNDED"].includes(s)) return "REJECTED";
  return "PENDING";
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers });

  try {
    const supabaseAdmin = createAdminClient();

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
    if (!allowed) return rateLimitResponse(origin, retryAfter);

    const parsed = await readAndParseJsonBody(req, checkPaymentStatusSchema, headers);
    if (!parsed.ok) return parsed.response;
    const { subscriptionId } = parsed.data;

    const { data: row, error: rowError } = await supabaseAdmin
      .from("payments")
      .select("id, plan, status")
      .eq("asaas_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (rowError) throw new Error(`DB payments: ${rowError.message}`);
    if (!row) return reply({ error: "Assinatura nao encontrada" }, 404);

    if (row.status === "APPROVED") return reply({ status: "APPROVED", asaasStatus: null });
    if (row.status === "CANCELED" || row.status === "CANCELING") {
      return reply({ status: "REJECTED", asaasStatus: "CANCELED" });
    }

    const subRes = await asaasRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
    if (!subRes.ok) throw new Error(`Nao foi possivel consultar a assinatura (status ${subRes.status})`);
    const externalReference = String(subRes.data?.externalReference ?? "");
    if (!externalReference.startsWith(`${user.id}_${row.plan}_`)) {
      return reply({ error: "Assinatura nao pertence a este usuario" }, 403);
    }

    const paymentsRes = await asaasRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}/payments?limit=1`);
    if (!paymentsRes.ok) throw new Error(`Nao foi possivel consultar a cobranca (status ${paymentsRes.status})`);
    const lastPayment = paymentsRes.data?.data?.[0];

    const status = lastPayment?.status ? mapStatus(lastPayment.status) : "PENDING";

    if (status === "APPROVED") {
      await confirmSubscriptionPayment(supabaseAdmin, {
        userId: user.id,
        subscriptionId,
        plan: row.plan,
        asaasPaymentId: lastPayment?.id ?? null,
        dueDate: lastPayment?.dueDate ?? null,
      });
    } else if (status === "REJECTED" && row.status === "PENDING") {
      const { error } = await supabaseAdmin
        .from("payments")
        .update({ status: "REJECTED", asaas_payment_id: lastPayment?.id ?? null })
        .eq("id", row.id)
        .eq("status", "PENDING");
      if (error) throw new Error(`DB payments: ${error.message}`);
    }

    return reply({ status, asaasStatus: lastPayment?.status ?? null });
  } catch (error) {
    return reply({ error: (error as Error)?.message ?? "Erro" }, 400);
  }
});
