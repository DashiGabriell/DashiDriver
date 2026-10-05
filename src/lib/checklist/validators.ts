import { z } from 'zod';
import { ChecklistTypes } from './constants';

export const checklistSchema = z.object({
  company_id: z.string().uuid('ID da empresa inválido'),
  user_id: z.string().uuid('ID do usuário inválido'),
  vehicle_id: z.string().uuid('Veículo inválido'),
  driver_id: z.string().uuid('Motorista inválido').optional().nullable(),
  type: z.enum([
    ChecklistTypes.ENTREGA,
    ChecklistTypes.DEVOLUCAO,
    ChecklistTypes.TROCA_MOTORISTA,
    ChecklistTypes.POS_MANUTENCAO,
    ChecklistTypes.AVARIA,
    ChecklistTypes.AUDITORIA,
    ChecklistTypes.SEMANAL_AUTOMATIZADA,
  ]),
  notes: z.string().optional().nullable(),
});

export const checklistImageSchema = z.object({
  checklist_id: z.string().uuid('Checklist inválido'),
  step_key: z.string().min(1, 'Chave do passo é obrigatória'),
  step_label: z.string().min(1, 'Rótulo do passo é obrigatório'),
  step_order: z.number().int(),
  position: z.number().int(),
  metadata: z.record(z.any()).optional(),
  details: z.string().optional(),
});

export const fileValidationSchema = z.instanceof(File)
  .refine(file => file.size <= 20 * 1024 * 1024, 'O arquivo deve ter no máximo 20MB')
  .refine(
    file => ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type.toLowerCase()) || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif'),
    'Formato de imagem não suportado. Use JPEG, PNG ou WebP.'
  );

export type ChecklistInput = z.infer<typeof checklistSchema>;
export type ChecklistImageInput = z.infer<typeof checklistImageSchema>;
