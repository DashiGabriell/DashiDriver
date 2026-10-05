import { z } from "zod";

export const manutencaoSchema = z.object({
  vehicle_id: z.string().min(1, "Veículo é obrigatório"),
  servico: z.string().min(1, "Serviço é obrigatório"),
  oficina: z.string().min(1, "Oficina é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  valor: z.string().optional(),
  observacao: z.string().optional(),
});

export type ManutencaoInput = z.infer<typeof manutencaoSchema>;
