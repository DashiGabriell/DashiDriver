import { supabase } from '@/integrations/supabase/client';

export interface FleetKmControlRow {
  vehicle_id: string;
  placa: string;
  modelo: string;
  km_atual: number;
  limite_semanal: number;
  km_semana_atual: number;
  excedente: number;
  ultima_atualizacao: string | null;
}

export const kmHistoryService = {
  async record(params: {
    company_id: string;
    vehicle_id: string;
    driver_id?: string | null;
    km: number;
    source: 'checklist' | 'maintenance' | 'manual_edit';
    source_id?: string;
    observation?: string;
    userId?: string;
  }) {
    const { data, error } = await supabase
      .from('vehicle_km_history')
      .insert({
        company_id: params.company_id,
        vehicle_id: params.vehicle_id,
        driver_id: params.driver_id || null,
        km: params.km,
        source: params.source,
        source_id: params.source_id || null,
        observation: params.observation || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (params.userId) {
      await this.checkAndCreateKmAlert({
        vehicleId: params.vehicle_id,
        companyId: params.company_id,
        userId: params.userId,
      }).catch(() => {});
    }

    return data;
  },

  async updateVehicleKm(vehicleId: string, km: number) {
    const { error } = await supabase
      .from('carcontrol_vehicles')
      .update({
        km_atual: km,
        ultima_atualizacao_km: new Date().toISOString(),
      })
      .eq('id', vehicleId);

    if (error) throw error;
  },

  async getHistory(vehicleId: string, limit = 20) {
    const { data, error } = await supabase
      .from('vehicle_km_history')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getLastKm(vehicleId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('vehicle_km_history')
      .select('km')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.km ?? null;
  },

  async getStats(vehicleId: string) {
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const { data: history, error } = await supabase
      .from('vehicle_km_history')
      .select('km, created_at')
      .eq('vehicle_id', vehicleId)
      .gte('created_at', trintaDiasAtras.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!history || history.length < 2) {
      return { kmTotal: 0, km30dias: 0, mediaDiaria: 0, ultimaAtualizacao: null };
    }

    const primeiro = history[0].km;
    const ultimo = history[history.length - 1].km;
    const km30dias = Math.abs(ultimo - primeiro);

    const diffDias = Math.max(
      1,
      (new Date(history[history.length - 1].created_at).getTime() -
        new Date(history[0].created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      kmTotal: ultimo,
      km30dias,
      mediaDiaria: Math.round(km30dias / diffDias),
      ultimaAtualizacao: history[history.length - 1].created_at,
    };
  },

  async getFleetKmControl(companyId: string): Promise<FleetKmControlRow[]> {
    const { data, error } = await supabase
      .rpc('get_fleet_km_control', { p_company_id: companyId });

    if (error) throw error;
    return (data || []) as FleetKmControlRow[];
  },

  async setWeeklyLimit(vehicleId: string, limit: number) {
    const { error } = await supabase
      .from('carcontrol_vehicles')
      .update({ limite_semanal_km: limit })
      .eq('id', vehicleId);

    if (error) throw error;
  },

  async getVehicleWeeklyKm(vehicleId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_vehicle_weekly_km', { p_vehicle_id: vehicleId });

    if (error) throw error;
    return (data ?? 0) as number;
  },

  async checkAndCreateKmAlert(params: {
    vehicleId: string;
    companyId: string;
    userId: string;
  }) {
    const { vehicleId, companyId, userId } = params;

    const [weeklyKm, vehicle] = await Promise.all([
      this.getVehicleWeeklyKm(vehicleId),
      supabase.from('carcontrol_vehicles').select('limite_semanal_km, placa, modelo').eq('id', vehicleId).single().then(r => r.data),
    ]);

    if (!vehicle?.limite_semanal_km || vehicle.limite_semanal_km <= 0) return;
    if (weeklyKm <= vehicle.limite_semanal_km) return;

    const { notificationService } = await import('./notificationService');

    await notificationService.createNotification({
      companyId,
      userId,
      type: 'critical',
      category: 'km_limit_exceeded',
      title: 'Limite semanal de KM excedido',
      message: `${vehicle.placa} - ${vehicle.modelo} já rodou ${weeklyKm} km esta semana (limite: ${vehicle.limite_semanal_km} km)`,
      actionUrl: '/controle-km',
      relatedEntity: { type: 'veiculo', id: vehicleId },
      dedupeSuffix: `week-${getWeekKey()}`,
    });
  },
};

function getWeekKey() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  return `${startOfWeek.getFullYear()}-W${String(Math.ceil((startOfWeek.getTime() - new Date(startOfWeek.getFullYear(), 0, 1).getTime()) / 604800000)).padStart(2, '0')}`;
}
