import { z } from "zod";

export const veiculoSchema = z.object({
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  placa: z.string().min(1, "Placa é obrigatória"),
  vencimento_parcela: z.string().min(1, "Vencimento da parcela é obrigatório"),
  vencimento_seguro: z.string().min(1, "Vencimento do seguro é obrigatório"),
  ano: z.string().optional(),
  cor: z.string().optional(),
});

export type VeiculoInput = z.infer<typeof veiculoSchema>;
