import { describe, it, expect } from 'vitest';
import { checklistSchema, checklistImageSchema, fileValidationSchema } from '@/lib/checklist/validators';
import { ChecklistTypes } from '@/lib/checklist/constants';

describe('Checklist Validators', () => {
  describe('checklistSchema', () => {
    it('deve validar um input de checklist correto', () => {
      const input = {
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        vehicle_id: '550e8400-e29b-41d4-a716-446655440002',
        driver_id: '550e8400-e29b-41d4-a716-446655440003',
        type: ChecklistTypes.ENTREGA,
        notes: 'Vistoria ok',
      };
      const result = checklistSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('deve falhar se IDs não forem UUIDs válidos', () => {
      const input = {
        company_id: 'invalid-id',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        vehicle_id: '550e8400-e29b-41d4-a716-446655440002',
        type: ChecklistTypes.ENTREGA,
      };
      const result = checklistSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('deve falhar se o tipo for inválido', () => {
      const input = {
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        vehicle_id: '550e8400-e29b-41d4-a716-446655440002',
        type: 'tipo_inexistente',
      };
      const result = checklistSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('checklistImageSchema', () => {
    it('deve validar um input de imagem correto', () => {
      const input = {
        checklist_id: '550e8400-e29b-41d4-a716-446655440000',
        step_key: 'frente',
        step_label: 'Foto Frontal',
        step_order: 1,
        position: 1,
      };
      const result = checklistImageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('fileValidationSchema', () => {
    it('deve validar tipos de arquivos permitidos', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      const result = fileValidationSchema.safeParse(file);
      expect(result.success).toBe(true);
    });

    it('deve falhar para tipos de arquivos não suportados', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const result = fileValidationSchema.safeParse(file);
      expect(result.success).toBe(false);
    });
  });
});
