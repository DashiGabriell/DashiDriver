import { supabase } from '@/integrations/supabase/client';
import { ChecklistInput, ChecklistImageInput } from '@/lib/checklist/validators';
import { ChecklistStatus, ChecklistStatuses, ChecklistTypes } from '@/lib/checklist/constants';
import { alertService } from './alertService';
import { kmHistoryService } from './kmHistoryService';

/**
 * Service para operações de banco de dados do módulo de Checklist
 */
export const checklistService = {
  /**
   * Cria um novo registro de checklist
   */
  async create(input: ChecklistInput) {
    // Garantir que o JWT contenha o company_id
    const { data: jwtData } = await supabase.auth.getUser();
    if (!jwtData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('carcontrol_checklists')
      .insert({
        ...input,
        status: ChecklistStatuses.EM_ANDAMENTO,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Adiciona uma imagem a um checklist
   */
  async addImage(input: ChecklistImageInput & { image_url: string; thumbnail_url: string; watermarked_url: string; company_id: string; odometro_km?: number | null }) {
    const { data, error } = await supabase
      .from('carcontrol_checklist_images')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtém detalhes de um checklist com suas imagens
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .rpc('get_checklist_with_images', { p_checklist_id: id });

    if (error) throw error;
    return data[0];
  },

  /**
   * Finaliza um checklist
   */
  async finalize(id: string) {
    const { data: jwtData } = await supabase.auth.getUser();
    const userId = jwtData.user?.id;

    // 1. Obter dados atuais para saber o tipo e veículo
    const current = await this.getById(id);

    // 2. Atualizar status
    const { data, error } = await supabase
      .from('carcontrol_checklists')
      .update({
        status: ChecklistStatuses.FINALIZADO,
        finished_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 3. Registrar KM no histórico se houver imagem do painel com odometro_km
    const painelImage = current.images?.find(
      (img: any) => img.step_key === 'painel' && img.odometro_km
    );
    if (painelImage) {
      await kmHistoryService.record({
        company_id: current.company_id,
        vehicle_id: current.vehicle_id,
        driver_id: current.driver_id,
        km: painelImage.odometro_km,
        source: 'checklist',
        source_id: id,
        observation: painelImage.details || undefined,
        userId,
      });
      await kmHistoryService.updateVehicleKm(current.vehicle_id, painelImage.odometro_km);
    }

    // 4. Se for do tipo avaria, gerar alerta crítico
    if (current.type === ChecklistTypes.AVARIA) {
      await alertService.create({
        company_id: current.company_id,
        vehicle_id: current.vehicle_id,
        driver_id: current.driver_id,
        tipo: 'avaria',
        severidade: 'critico',
        titulo: 'Nova Avaria Registrada',
        descricao: `Uma nova vistoria de avaria foi finalizada para o veículo ${current.vehicle_placa}.`,
      });
    }

    return data;
  },

  /**
   * Cancela um checklist
   */
  async cancel(id: string) {
    const { data, error } = await supabase
      .from('carcontrol_checklists')
      .update({ status: ChecklistStatuses.CANCELADO })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove uma imagem de um checklist
   */
  async deleteImage(imageId: string) {
    const { data, error } = await supabase
      .from('carcontrol_checklist_images')
      .delete()
      .eq('id', imageId)
      .select('image_url, thumbnail_url, watermarked_url')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cria um token de compartilhamento para o checklist
   */
  async createShareToken(checklistId: string, expiresAt?: string) {
    const { data, error } = await supabase
      .rpc('create_checklist_share_token', {
        p_checklist_id: checklistId,
        p_expires_at: expiresAt || null,
      });

    if (error) throw error;
    return data as { success: boolean; token: string; url: string };
  },

  /**
   * Busca checklist compartilhado por token (público, sem autenticação)
   */
  async getSharedByToken(token: string) {
    const { data, error } = await supabase
      .rpc('get_shared_checklist_by_token', { p_token: token });

    if (error) throw error;
    return data as any;
  },

  /**
   * Adiciona imagem a um checklist via token compartilhado
   */
  async addSharedImage(token: string, params: {
    stepKey: string;
    stepLabel: string;
    stepOrder: number;
    imageUrl: string;
    thumbnailUrl?: string;
  }) {
    const { data, error } = await supabase
      .rpc('add_shared_checklist_image', {
        p_token: token,
        p_step_key: params.stepKey,
        p_step_label: params.stepLabel,
        p_step_order: params.stepOrder,
        p_image_url: params.imageUrl,
        p_thumbnail_url: params.thumbnailUrl || null,
      });

    if (error) throw error;
    return data as { success: boolean; image_id: string };
  },

  /**
   * Lista checklists da empresa com filtros
   */
  async list(filters: { vehicle_id?: string; driver_id?: string; type?: string; status?: ChecklistStatus } = {}) {
    let query = supabase
      .from('checklist_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id);
    if (filters.driver_id) query = query.eq('driver_id', filters.driver_id);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Lista detalhada com joins (desktop + mobile shared)
   */
  async listDetailed() {
    const { data, error } = await supabase
      .from('carcontrol_checklists')
      .select(`
        id,
        type,
        status,
        started_at,
        finished_at,
        notes,
        vehicle:carcontrol_vehicles(placa, modelo),
        driver:carcontrol_drivers(nome),
        carcontrol_checklist_images(id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      checklist_id: item.id,
      vehicle_placa: item.vehicle?.placa || null,
      vehicle_modelo: item.vehicle?.modelo || null,
      driver_name: item.driver?.nome || null,
      /** Alias kept for mobile UI compatibility */
      motorista_nome: item.driver?.nome || null,
      type: item.type,
      status: item.status,
      total_images: item.carcontrol_checklist_images?.length || 0,
      started_at: item.started_at,
      finished_at: item.finished_at,
      notes: item.notes,
    }));
  },

  async remove(id: string) {
    const { error } = await supabase.from('carcontrol_checklists').delete().eq('id', id);
    if (error) throw error;
  },
};
