import { z } from "zod";

export const motoristaSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter exatamente 11 dígitos").regex(/^\d{11}$/, "CPF deve conter apenas números"),
  cnh: z.string().min(1, "CNH é obrigatória"),
  telefone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
  inicio: z.string().min(1, "Data de início é obrigatória"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type MotoristaInput = z.infer<typeof motoristaSchema>;
