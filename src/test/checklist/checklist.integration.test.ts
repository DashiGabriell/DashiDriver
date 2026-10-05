import { describe, it, expect, vi } from 'vitest';
import { checklistService } from '@/integrations/supabase/services/checklistService';
import { ChecklistTypes } from '@/lib/checklist/constants';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'u1' } },
          error: null,
        }),
      ),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: { id: 'mock-id' }, error: null }),
      ),
    })),
    rpc: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 'mock-id',
            type: 'entrega',
            company_id: 'c1',
            vehicle_id: 'v1',
            images: [],
          },
        ],
        error: null,
      }),
    ),
  },
}));

vi.mock('@/integrations/supabase/services/alertService', () => ({
  alertService: { create: vi.fn() },
}));

vi.mock('@/integrations/supabase/services/kmHistoryService', () => ({
  kmHistoryService: {
    record: vi.fn(),
    updateVehicleKm: vi.fn(),
  },
}));

describe('Checklist Service Integration', () => {
  it('deve criar um checklist com sucesso', async () => {
    const input = {
      company_id: 'c1',
      user_id: 'u1',
      vehicle_id: 'v1',
      type: ChecklistTypes.ENTREGA,
    };

    const result = await checklistService.create(input as any);
    expect(result).toBeDefined();
    expect(result.id).toBe('mock-id');
  });

  it('deve obter um checklist por ID', async () => {
    const result = await checklistService.getById('mock-id');
    expect(result).toBeDefined();
    expect(result.id).toBe('mock-id');
  });

  it('deve finalizar um checklist', async () => {
    vi.spyOn(checklistService, 'getById').mockResolvedValue({
      id: 'mock-id',
      type: 'entrega',
      company_id: 'c1',
      vehicle_id: 'v1',
      images: [],
    } as any);

    const result = await checklistService.finalize('mock-id');
    expect(result).toBeDefined();
    expect(result.id).toBe('mock-id');
  });
});
