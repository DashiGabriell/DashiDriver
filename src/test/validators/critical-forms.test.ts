import { describe, expect, it } from "vitest";
import {
  buildCheckoutSchema,
  isValidCardNumber,
  isValidCnpj,
  isValidCpf,
  isValidExpiry,
} from "@/lib/validators/checkout";
import { maskCpfCnpj, maskPhone } from "@/lib/mask";

const address = {
  nome: "Maria Silva",
  cpf: "529.982.247-25",
  cep: "01310-100",
  endereco: "Avenida Paulista",
  numero: "1000",
  telefone: "(11) 99999-9999",
  cidade: "São Paulo",
  estado: "SP",
};
import { marketplaceSellSchema } from "@/lib/validators/marketplace-sell";
import { checklistFormSchema } from "@/lib/validators/checklist-form";

describe("checkout validators", () => {
  it("rejects short name on free plan", () => {
    const schema = buildCheckoutSchema({ isFree: true, billingType: "PIX" });
    const result = schema.safeParse({ ...address, nome: "Ab" });
    expect(result.success).toBe(false);
  });

  it("accepts valid free checkout payload", () => {
    const schema = buildCheckoutSchema({ isFree: true, billingType: "PIX" });
    expect(schema.safeParse(address).success).toBe(true);
  });

  it("accepts a valid CNPJ in the cpf field", () => {
    const schema = buildCheckoutSchema({ isFree: false, billingType: "PIX" });
    expect(schema.safeParse({ ...address, cpf: "11.222.333/0001-81" }).success).toBe(true);
  });

  it("rejects CPF with wrong check digits", () => {
    const schema = buildCheckoutSchema({ isFree: false, billingType: "BOLETO" });
    expect(schema.safeParse({ ...address, cpf: "000.000.000-00" }).success).toBe(false);
    expect(schema.safeParse({ ...address, cpf: "529.982.247-26" }).success).toBe(false);
  });

  it("requires card fields for credit card billing", () => {
    const schema = buildCheckoutSchema({ isFree: false, billingType: "CREDIT_CARD" });
    expect(schema.safeParse(address).success).toBe(false);
  });

  it("accepts a complete credit card payload", () => {
    const schema = buildCheckoutSchema({ isFree: false, billingType: "CREDIT_CARD" });
    const nextYear = String((new Date().getFullYear() + 1) % 100).padStart(2, "0");
    const result = schema.safeParse({
      ...address,
      cardName: "MARIA SILVA",
      cardNumber: "4111 1111 1111 1111",
      cardExpiry: `12/${nextYear}`,
      cardCvv: "123",
    });
    expect(result.success).toBe(true);
  });
});

describe("checkout document and card checks", () => {
  it("validates CPF and CNPJ check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false);
  });

  it("validates card numbers with Luhn", () => {
    expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true);
    expect(isValidCardNumber("4111 1111 1111 1112")).toBe(false);
    expect(isValidCardNumber("4111")).toBe(false);
  });

  it("rejects expired and malformed expiry dates", () => {
    const now = new Date(2026, 9, 5);
    expect(isValidExpiry("10/26", now)).toBe(true);
    expect(isValidExpiry("09/26", now)).toBe(false);
    expect(isValidExpiry("13/27", now)).toBe(false);
    expect(isValidExpiry("1/27", now)).toBe(false);
  });

  it("masks CPF, CNPJ and phones", () => {
    expect(maskCpfCnpj("52998224725")).toBe("529.982.247-25");
    expect(maskCpfCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("marketplace sell validator", () => {
  it("accepts description field", () => {
    const result = marketplaceSellSchema.safeParse({
      title: "Carro",
      marca: "Fiat",
      modelo: "Argo",
      price: 100,
      categoryId: "cars",
      cidade: "São Paulo",
      estado: "SP",
      description: "Bom estado",
    });
    expect(result.success).toBe(true);
  });
});

describe("checklist form validator", () => {
  it("requires vehicle_id", () => {
    const result = checklistFormSchema.safeParse({
      vehicle_id: "",
      type: "entrega",
    });
    expect(result.success).toBe(false);
  });
});
