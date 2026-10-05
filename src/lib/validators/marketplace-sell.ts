import { z } from "zod";

export const marketplaceSellSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  price: z.number().positive("Valor deve ser maior que zero"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  ano: z.string().optional(),
  quilometragem: z.string().optional(),
  description: z.string().max(5000).optional(),
});

export type MarketplaceSellInput = z.infer<typeof marketplaceSellSchema>;
