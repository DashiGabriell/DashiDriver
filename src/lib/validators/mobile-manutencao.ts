import { z } from "zod";

export const mobileManutencaoSchema = z.object({
  vehicle_id: z.string().min(1, "Veículo é obrigatório"),
  servico: z.string().min(1, "Serviço é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  oficina: z.string().optional(),
  observacao: z.string().optional(),
});

export type MobileManutencaoInput = z.infer<typeof mobileManutencaoSchema>;
