import { z } from "zod";

/** Form schema for creating a checklist (UI) */
export const checklistFormSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione um veículo"),
  driver_id: z.string().optional(),
  type: z.enum([
    "entrega",
    "devolucao",
    "avaria",
    "pos_manutencao",
    "semanal_automatizada",
    "troca_motorista",
    "auditoria",
  ]),
  notes: z.string().optional(),
});

export type ChecklistFormData = z.infer<typeof checklistFormSchema>;
