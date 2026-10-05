import { z } from "zod";

export const checkoutAddressSchema = {
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(14, "CPF inválido"),
  cep: z.string().min(9, "CEP inválido"),
  endereco: z.string().min(5, "Endereço obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  telefone: z.string().min(14, "Telefone inválido"),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(3, "Cidade obrigatória"),
  estado: z.string().length(2, "UF inválido"),
};

export const checkoutCardSchema = {
  cardName: z.string().min(3, "Nome no cartão obrigatório"),
  cardNumber: z.string().min(19, "Número do cartão inválido"),
  cardExpiry: z.string().min(5, "Validade inválida (MM/AA)"),
  cardCvv: z.string().min(3, "CVV inválido"),
};

export const checkoutFreeSchema = z.object(checkoutAddressSchema);

export const checkoutCreditCardSchema = z.object({
  ...checkoutAddressSchema,
  ...checkoutCardSchema,
});

export const checkoutBoletoPixSchema = z.object({
  ...checkoutAddressSchema,
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

export function buildCheckoutSchema(opts: {
  isFree: boolean;
  billingType: "CREDIT_CARD" | "BOLETO" | "PIX";
}) {
  if (opts.isFree) return checkoutFreeSchema;
  if (opts.billingType === "CREDIT_CARD") return checkoutCreditCardSchema;
  return checkoutBoletoPixSchema;
}

export type CheckoutFormValues = z.infer<typeof checkoutCreditCardSchema>;
