import { describe, expect, it } from "vitest";
import { buildCheckoutSchema } from "@/lib/validators/checkout";
import { marketplaceSellSchema } from "@/lib/validators/marketplace-sell";
import { checklistFormSchema } from "@/lib/validators/checklist-form";

describe("checkout validators", () => {
  it("rejects short name on free plan", () => {
    const schema = buildCheckoutSchema({ isFree: true, billingType: "PIX" });
    const result = schema.safeParse({
      nome: "Ab",
      cpf: "000.000.000-00",
      cep: "00000-000",
      endereco: "Rua Teste",
      numero: "1",
      telefone: "(11) 99999-9999",
      cidade: "São Paulo",
      estado: "SP",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid free checkout payload", () => {
    const schema = buildCheckoutSchema({ isFree: true, billingType: "PIX" });
    const result = schema.safeParse({
      nome: "Maria Silva",
      cpf: "000.000.000-00",
      cep: "00000-000",
      endereco: "Rua Teste",
      numero: "1",
      telefone: "(11) 99999-9999",
      cidade: "São Paulo",
      estado: "SP",
    });
    expect(result.success).toBe(true);
  });

  it("requires card fields for credit card billing", () => {
    const schema = buildCheckoutSchema({ isFree: false, billingType: "CREDIT_CARD" });
    const result = schema.safeParse({
      nome: "Maria Silva",
      cpf: "000.000.000-00",
      cep: "00000-000",
      endereco: "Rua Teste",
      numero: "1",
      telefone: "(11) 99999-9999",
      cidade: "São Paulo",
      estado: "SP",
    });
    expect(result.success).toBe(false);
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
