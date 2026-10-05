import { describe, expect, it } from "vitest";
import { asaasWebhookSchema, processPaymentSchema } from "@/lib/validators/asaas-webhook";
import {
  paymentPatchForAction,
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
