import { z } from "zod";

/**
 * Mirror of supabase/functions/_shared/schemas.ts asaasWebhookSchema
 * for Vitest (Node). Keep shapes aligned when changing Edge schemas.
 */
export const asaasWebhookSchema = z
  .object({
    event: z.string().min(1, "event obrigatorio"),
    payment: z
      .object({
        id: z.string().optional(),
        subscription: z.string().optional().nullable(),
        status: z.string().optional(),
      })
      .passthrough()
      .optional()
      .nullable(),
    subscription: z
      .union([z.string(), z.object({ id: z.string().optional() }).passthrough()])
      .optional()
      .nullable(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    const top = typeof data.subscription === "string" ? data.subscription : data.subscription?.id;
    const sub = data.payment?.subscription ?? top;
    if (!sub) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "subscription ID ausente",
        path: ["payment", "subscription"],
      });
    }
  });

export const processPaymentSchema = z
  .object({
    plan: z.string().min(1, "Plano obrigatorio"),
    planType: z.enum(["gestao", "marketplace"]).optional(),
    amount: z.number().finite().nonnegative("Valor invalido").optional(),
    billingType: z.enum(["CREDIT_CARD", "BOLETO", "PIX"]).optional(),
    coupon_code: z.string().trim().min(1).max(64).optional().nullable(),
    validate_only: z.boolean().optional(),
  })
  .passthrough();

export type AsaasWebhookInput = z.infer<typeof asaasWebhookSchema>;
