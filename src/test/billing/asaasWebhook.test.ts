import { describe, expect, it } from "vitest";
import { asaasWebhookSchema, processPaymentSchema } from "@/lib/validators/asaas-webhook";
import {
  extractSubscriptionId,
  hasActiveAccess,
  nextExpiration,
  paymentPatchForAction,
  pendingRowOutcome,
  planDef,
  resolveWebhookAction,
} from "@/lib/billing/asaasWebhookLogic";

describe("asaasWebhookSchema", () => {
  it("rejects payload without subscription", () => {
    const result = asaasWebhookSchema.safeParse({
      event: "PAYMENT_RECEIVED",
      payment: { id: "pay_1" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts subscription on payment object", () => {
    const result = asaasWebhookSchema.safeParse({
      event: "PAYMENT_RECEIVED",
      payment: { id: "pay_1", subscription: "sub_abc" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts top-level subscription", () => {
    const result = asaasWebhookSchema.safeParse({
      event: "PAYMENT_CONFIRMED",
      subscription: "sub_xyz",
    });
    expect(result.success).toBe(true);
  });

  it("accepts subscription object sent on SUBSCRIPTION_* events", () => {
    const result = asaasWebhookSchema.safeParse({
      event: "SUBSCRIPTION_DELETED",
      subscription: { id: "sub_obj", status: "INACTIVE" },
    });
    expect(result.success).toBe(true);
  });
});

describe("extractSubscriptionId", () => {
  it("reads payment.subscription, top-level string and object", () => {
    expect(extractSubscriptionId({ payment: { subscription: "sub_a" } })).toBe("sub_a");
    expect(extractSubscriptionId({ subscription: "sub_b" })).toBe("sub_b");
    expect(extractSubscriptionId({ subscription: { id: "sub_c" } })).toBe("sub_c");
  });

  it("returns null for one-off charges and garbage", () => {
    expect(extractSubscriptionId({ payment: { id: "pay_1" } })).toBeNull();
    expect(extractSubscriptionId(null)).toBeNull();
    expect(extractSubscriptionId("x")).toBeNull();
  });
});

describe("nextExpiration", () => {
  const now = new Date("2026-10-05T10:00:00.000Z");

  it("is one month after the charge due date", () => {
    expect(nextExpiration(null, "2026-10-05", now)).toBe("2026-11-05T12:00:00.000Z");
  });

  it("falls back to now without due date", () => {
    expect(nextExpiration(null, null, now)).toBe("2026-11-05T10:00:00.000Z");
  });

  it("clamps to the last day of shorter months", () => {
    expect(nextExpiration(null, "2026-01-31", now)).toBe("2026-02-28T12:00:00.000Z");
  });

  it("never moves an existing later date backwards (replay-safe)", () => {
    const later = "2026-12-20T00:00:00.000Z";
    expect(nextExpiration(later, "2026-10-05", now)).toBe(later);
    const first = nextExpiration(null, "2026-10-05", now);
    expect(nextExpiration(first, "2026-10-05", now)).toBe(first);
  });

  it("renews from the next cycle due date", () => {
    expect(nextExpiration("2026-11-05T12:00:00.000Z", "2026-11-05", now)).toBe("2026-12-05T12:00:00.000Z");
  });
});

describe("pendingRowOutcome", () => {
  it("cancels abandoned checkouts at Asaas when the first charge is overdue", () => {
    expect(pendingRowOutcome("PAYMENT_OVERDUE")).toBe("cancel_remote");
  });

  it("closes rows whose subscription ended", () => {
    expect(pendingRowOutcome("SUBSCRIPTION_DELETED")).toBe("canceled");
  });

  it("rejects refused cards", () => {
    expect(pendingRowOutcome("PAYMENT_CREDIT_CARD_CAPTURE_REFUSED")).toBe("rejected");
  });
});

describe("hasActiveAccess", () => {
  const nowMs = new Date("2026-10-05T00:00:00.000Z").getTime();
  const base = { trial: null, created_at: "2026-01-01T00:00:00.000Z", status: null, plano_ativo: null };

  it("keeps access for active company, paid plan or running trial", () => {
    expect(hasActiveAccess(base, true, nowMs)).toBe(true);
    expect(hasActiveAccess({ ...base, status: "ativo", plano_ativo: "gestao-pro" }, false, nowMs)).toBe(true);
    expect(hasActiveAccess({ ...base, trial: "ativo", created_at: "2026-10-03T00:00:00.000Z" }, false, nowMs)).toBe(true);
  });

  it("denies expired trial and pending plan", () => {
    expect(hasActiveAccess({ ...base, trial: "ativo" }, false, nowMs)).toBe(false);
    expect(hasActiveAccess({ ...base, status: "pending", plano_ativo: "gestao-pro" }, false, nowMs)).toBe(false);
    expect(hasActiveAccess(null, false, nowMs)).toBe(false);
  });
});

describe("processPaymentSchema", () => {
  it("rejects negative amount", () => {
    const result = processPaymentSchema.safeParse({
      plan: "gestao-pro",
      amount: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal valid payment body", () => {
    const result = processPaymentSchema.safeParse({
      plan: "gestao-pro",
      amount: 99.9,
      billingType: "PIX",
    });
    expect(result.success).toBe(true);
  });

  it("accepts body without amount (price is resolved server-side)", () => {
    const result = processPaymentSchema.safeParse({ plan: "gestao-pro" });
    expect(result.success).toBe(true);
  });
});

describe("asaas webhook idempotency (decision layer)", () => {
  it("maps activate events consistently on replay", () => {
    expect(resolveWebhookAction("PAYMENT_RECEIVED")).toBe("activate");
    expect(resolveWebhookAction("PAYMENT_RECEIVED")).toBe("activate");
    expect(resolveWebhookAction("PAYMENT_CONFIRMED")).toBe("activate");
  });

  it("maps deactivate events consistently on replay", () => {
    expect(resolveWebhookAction("PAYMENT_OVERDUE")).toBe("deactivate");
    expect(resolveWebhookAction("SUBSCRIPTION_CANCELED")).toBe("deactivate");
    expect(resolveWebhookAction("PAYMENT_FAILED")).toBe("deactivate");
    expect(resolveWebhookAction("SUBSCRIPTION_DELETED")).toBe("deactivate");
    expect(resolveWebhookAction("PAYMENT_CREDIT_CARD_CAPTURE_REFUSED")).toBe("deactivate");
  });

  it("ignores unknown events", () => {
    expect(resolveWebhookAction("PAYMENT_CREATED")).toBe("ignore");
  });

  it("produces identical payment patches for repeated activate", () => {
    const paidAt = "2026-07-23T15:00:00.000Z";
    const a = paymentPatchForAction("activate", "pay_1", paidAt);
    const b = paymentPatchForAction("activate", "pay_1", paidAt);
    expect(a).toEqual(b);
    expect(a?.status).toBe("APPROVED");
  });

  it("resolves known plan slugs", () => {
    expect(planDef("gestao-pro")).toEqual({ type: "gestao", saasPlan: "PRO" });
    expect(planDef("marketplace-elite")).toEqual({ type: "marketplace", mktPlan: "ELITE" });
  });

  it("throws on invalid plan slug", () => {
    expect(() => planDef("unknown-plan")).toThrow(/Plano invalido/);
  });
});
