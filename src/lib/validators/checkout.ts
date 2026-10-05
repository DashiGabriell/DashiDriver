import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

export function isValidCpf(value: string): boolean {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10]);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = digits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const check = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return check(12) === Number(cnpj[12]) && check(13) === Number(cnpj[13]);
}

export function isValidCardNumber(value: string): boolean {
  const card = digits(value);
  if (card.length < 13 || card.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < card.length; i++) {
    let n = Number(card[card.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  const expiryMonth = year * 12 + (month - 1);
  return expiryMonth >= currentMonth && expiryMonth <= currentMonth + 20 * 12;
}

export const checkoutAddressSchema = {
  nome: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z.string().refine((v) => {
    const len = digits(v).length;
    return len === 11 ? isValidCpf(v) : len === 14 ? isValidCnpj(v) : false;
  }, "CPF ou CNPJ inválido. Confira os números"),
  cep: z.string().refine((v) => digits(v).length === 8, "CEP precisa ter 8 números"),
  endereco: z.string().trim().min(3, "Informe a rua"),
  numero: z.string().trim().min(1, "Informe o número (use S/N se não houver)"),
  telefone: z.string().refine((v) => digits(v).length >= 10, "Telefone com DDD, ex.: (11) 99999-9999"),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().trim().min(2, "Informe a cidade"),
  estado: z.string().trim().regex(/^[A-Za-z]{2}$/, "UF com 2 letras, ex.: SP"),
};

export const checkoutCardSchema = {
  cardName: z.string().trim().min(3, "Nome como está impresso no cartão"),
  cardNumber: z.string().refine(isValidCardNumber, "Número do cartão inválido. Confira os dígitos"),
  cardExpiry: z.string().refine((v) => isValidExpiry(v), "Validade inválida ou vencida (MM/AA)"),
  cardCvv: z.string().regex(/^\d{3,4}$/, "CVV tem 3 ou 4 números"),
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
