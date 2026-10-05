import { z } from "https://esm.sh/zod@3.25.76";

/** Shared Zod schemas for Edge Function request bodies */

export const processPaymentSchema = z.object({
  plan: z.string().min(1, "Plano obrigatorio"),
  planType: z.enum(["gestao", "marketplace"]).optional(),
  amount: z.number().finite().nonnegative("Valor invalido").optional(),
  billingType: z.enum(["CREDIT_CARD", "BOLETO", "PIX"]).optional(),
  coupon_code: z.string().trim().min(1).max(64).optional().nullable(),
  validate_only: z.boolean().optional(),
  nome: z.string().max(200).optional(),
  empresa: z.string().max(200).optional(),
  locadora: z.string().max(200).optional(),
  cpf: z.string().max(20).optional(),
  cep: z.string().max(12).optional(),
  endereco: z.string().max(300).optional(),
  numero: z.string().max(30).optional(),
  complemento: z.string().max(120).optional(),
  bairro: z.string().max(120).optional(),
  cidade: z.string().max(120).optional(),
  estado: z.string().max(2).optional(),
  telefone: z.string().max(30).optional(),
  cardName: z.string().max(200).optional(),
  cardNumber: z.string().max(30).optional(),
  cardExpiry: z.string().max(10).optional(),
  cardCvv: z.string().max(5).optional(),
}).passthrough();

export const asaasWebhookSchema = z.object({
  event: z.string().min(1, "event obrigatorio"),
  payment: z
    .object({
      id: z.string().optional(),
      subscription: z.string().optional().nullable(),
      status: z.string().optional(),
    })
    .passthrough()
    .optional(),
  subscription: z.string().optional().nullable(),
}).passthrough().superRefine((data, ctx) => {
  const sub = data.payment?.subscription ?? data.subscription;
  if (!sub) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "subscription ID ausente",
      path: ["payment", "subscription"],
    });
  }
});

export const marketplaceCreateListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().positive(),
  category_id: z.union([z.number().int().positive(), z.string().min(1)]),
  companyId: z.string().uuid(),
  condition_label: z.string().max(100).optional(),
}).passthrough();

export const impersonateUserSchema = z.object({
  target_user_id: z.string().uuid("target_user_id invalido"),
});

export const chatbotQuerySchema = z.object({
  message: z.string().trim().min(1, "Mensagem obrigatoria").max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(8000),
      }),
    )
    .max(40)
    .default([]),
  contextPages: z.array(z.string().max(20000)).max(20).default([]),
  currentPage: z.string().max(500).optional().default(""),
});

export const checkPaymentStatusSchema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId obrigatorio"),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type AsaasWebhookInput = z.infer<typeof asaasWebhookSchema>;
export type MarketplaceCreateListingInput = z.infer<typeof marketplaceCreateListingSchema>;
export type ImpersonateUserInput = z.infer<typeof impersonateUserSchema>;
export type ChatbotQueryInput = z.infer<typeof chatbotQuerySchema>;
export type CheckPaymentStatusInput = z.infer<typeof checkPaymentStatusSchema>;
